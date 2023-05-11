import { TRPCError } from '@trpc/server'
import { uniq } from 'lodash-es'

import { getGroupProposalPhase, GroupProposalPhase } from '../phase'
import { calculateDecimal } from '../functions/decimal'
import { authorized, Authorized } from '../schemas/basic/authorship'
import { Group } from '../schemas/v1/group'
import { proved, Proved } from '../schemas/basic/proof'
import {
  GroupProposal,
  groupProposalSchema,
} from '../schemas/v1/group-proposal'
import { GroupProposalVote } from '../schemas/v1/group-proposal-vote'
import verifyGroupProposal from './verify-group-proposal'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'
import { database } from '../database'

const schema = proved(authorized(groupProposalSchema))

export default async function verifyGroupProposalVote(
  groupProposalVote: Proved<Authorized<GroupProposalVote>>,
): Promise<{
  groupProposal: Proved<Authorized<GroupProposal>>
  group: Proved<Authorized<Group>>
}> {
  const [timestamp, storage] = await Promise.all([
    getPermalinkSnapshot(groupProposalVote.group_proposal).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    database.storage.findUnique({
      where: { permalink: groupProposalVote.group_proposal },
    }),
  ])
  if (!storage) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal not found' })
  }
  const groupProposal = schema.parse(storage.data)
  const { group } = await verifyGroupProposal(groupProposal)

  if (
    getGroupProposalPhase(new Date(), timestamp, group.duration) !==
    GroupProposalPhase.VOTING
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Not in voting phase',
    })
  }

  const votingPower = await calculateDecimal(
    group.permission.voting,
    groupProposalVote.authorship.author,
    groupProposal.snapshots,
  )
  if (
    groupProposal.voting_type === 'single' &&
    Object.keys(groupProposalVote.powers).length !== 1
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'More than 1 choice',
    })
  }
  if (
    groupProposal.voting_type === 'approval' &&
    uniq(Object.values(groupProposalVote.powers)).length !== 1
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Voting power not the same',
    })
  }
  if (!votingPower.eq(groupProposalVote.total_power)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Voting power not match',
    })
  }

  return { groupProposal, group }
}
