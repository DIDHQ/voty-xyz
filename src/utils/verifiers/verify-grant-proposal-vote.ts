import { TRPCError } from '@trpc/server'

import { getPhase, Phase } from '../phase'
import { calculateDecimal } from '../functions/number'
import { authorized, Authorized } from '../schemas/authorship'
import { Grant } from '../schemas/grant'
import { proved, Proved } from '../schemas/proof'
import { GrantProposal, grantProposalSchema } from '../schemas/grant-proposal'
import { GrantProposalVote } from '../schemas/grant-proposal-vote'
import verifyGrantProposal from './verify-grant-proposal'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'
import { database } from '../database'

const schema = proved(authorized(grantProposalSchema))

export default async function verifyGrantProposalVote(
  grantProposalVote: Proved<Authorized<GrantProposalVote>>,
): Promise<{
  grantProposal: Proved<Authorized<GrantProposal>>
  grant: Proved<Authorized<Grant>>
}> {
  const [timestamp, storage] = await Promise.all([
    getPermalinkSnapshot(grantProposalVote.grant_proposal).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    database.storage.findUnique({
      where: { permalink: grantProposalVote.grant_proposal },
    }),
  ])
  if (!timestamp || !storage) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal not found' })
  }
  const grantProposal = schema.parse(storage.data)
  const { grant } = await verifyGrantProposal(grantProposal)

  if (getPhase(new Date(), timestamp, grant.duration) !== Phase.VOTING) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Not in voting phase',
    })
  }

  const votingPower = await calculateDecimal(
    grant.permission.voting,
    grantProposalVote.authorship.author,
    grantProposal.snapshots,
  )
  if (Object.keys(grantProposalVote.powers).length !== 1) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'More than 1 choice',
    })
  }
  if (!votingPower.eq(grantProposalVote.total_power)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Voting power not match',
    })
  }

  return { grantProposal, grant }
}
