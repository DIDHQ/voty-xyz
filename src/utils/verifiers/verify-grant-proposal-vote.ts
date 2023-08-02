import { TRPCError } from '@trpc/server'

import { GrantPhase, getGrantPhase } from '../phase'
import { calculateDecimal } from '../functions/decimal'
import { authorized, Authorized } from '../schemas/basic/authorship'
import { Grant, grantSchema } from '../schemas/v1/grant'
import { proved, Proved } from '../schemas/basic/proof'
import {
  GrantProposal,
  grantProposalSchema,
} from '../schemas/v1/grant-proposal'
import { GrantProposalVote } from '../schemas/v1/grant-proposal-vote'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'
import { database } from '../database'

const grantProposalSchemaProvedAuthorized = proved(
  authorized(grantProposalSchema),
)

const grantSchemaProvedAuthorized = proved(authorized(grantSchema))

export default async function verifyGrantProposalVote(
  grantProposalVote: Proved<Authorized<GrantProposalVote>>,
): Promise<{
  grantProposal: Proved<Authorized<GrantProposal>>
  grant: Proved<Authorized<Grant>>
}> {
  const grantProposal = grantProposalSchemaProvedAuthorized.parse(
    (
      await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) =>
          eq(permalink, grantProposalVote.grant_proposal),
      })
    )?.data,
  )

  const grant = grantSchemaProvedAuthorized.parse(
    (
      await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, grantProposal.grant),
      })
    )?.data,
  )

  const grantProposalSelect =
    await database.query.grantProposalSelect.findFirst({
      where: ({ proposalPermalink }, { eq }) =>
        eq(proposalPermalink, grantProposalVote.grant_proposal),
    })
  if (grant.permission.selecting && !grantProposalSelect) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Proposal not selected',
    })
  }

  const timestamp = await getPermalinkSnapshot(grantProposal.grant).then(
    (snapshot) => getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
  )
  if (
    getGrantPhase(new Date(), timestamp, grant.duration) !== GrantPhase.VOTING
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Not in voting phase',
    })
  }

  const votingPower = await calculateDecimal(
    grant.permission.voting,
    grantProposalVote.authorship.author,
    grant.snapshots,
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
