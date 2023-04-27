import { TRPCError } from '@trpc/server'
import { uniq } from 'lodash-es'

import { getPhase, Phase } from '../phase'
import { calculateDecimal } from '../functions/number'
import { authorized, Authorized } from '../schemas/authorship'
import { Group } from '../schemas/group'
import { proved, Proved } from '../schemas/proof'
import { GroupProposal, groupProposalSchema } from '../schemas/group-proposal'
import { GroupProposalVote } from '../schemas/group-proposal-vote'
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
  if (!timestamp || !storage) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal not found' })
  }
  const groupProposal = schema.parse(storage.data)
  const { group } = await verifyGroupProposal(groupProposal)

  if (getPhase(new Date(), timestamp, group.duration) !== Phase.VOTING) {
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
