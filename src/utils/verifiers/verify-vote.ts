import { TRPCError } from '@trpc/server'

import { getPhase, Phase } from '../phase'
import { calculateDecimal } from '../functions/number'
import { authorized, Authorized } from '../schemas/authorship'
import { Group } from '../schemas/group'
import { proved, Proved } from '../schemas/proof'
import { Proposal, proposalSchema } from '../schemas/proposal'
import { Vote } from '../schemas/vote'
import verifyProposal from './verify-proposal'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'
import { database } from '../database'

const schema = proved(authorized(proposalSchema))

export default async function verifyVote(
  vote: Proved<Authorized<Vote>>,
): Promise<{
  proposal: Proved<Authorized<Proposal>>
  group: Group
}> {
  const [timestamp, data] = await Promise.all([
    getPermalinkSnapshot(vote.proposal).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    database.storage.findUnique({ where: { permalink: vote.proposal } }),
  ])
  if (!timestamp || !data) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal not found' })
  }
  const proposal = schema.parse(data.data)
  const { group } = await verifyProposal(proposal)

  if (getPhase(new Date(), timestamp, group.duration) !== Phase.VOTING) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Not in voting phase',
    })
  }

  const votingPower = await calculateDecimal(
    group.permission.voting,
    vote.authorship.author,
    proposal.snapshots,
  )
  if (!votingPower.eq(vote.power)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Voting power not match',
    })
  }

  return { proposal, group }
}
