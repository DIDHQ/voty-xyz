import { TRPCError } from '@trpc/server'

import { GrantPhase, getGrantPhase } from '../phase'
import { checkBoolean } from '../functions/boolean'
import { authorized, Authorized } from '../schemas/basic/authorship'
import { Grant, grantSchema } from '../schemas/v1/grant'
import { proved, Proved } from '../schemas/basic/proof'
import {
  GrantProposal,
  grantProposalSchema,
} from '../schemas/v1/grant-proposal'
import { GrantProposalSelect } from '../schemas/v1/grant-proposal-select'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'
import { database } from '../database'

const grantProposalSchemaProvedAuthorized = proved(
  authorized(grantProposalSchema),
)

const grantSchemaProvedAuthorized = proved(authorized(grantSchema))

export default async function verifyGrantProposalSelect(
  grantProposalSelect: Proved<Authorized<GrantProposalSelect>>,
): Promise<{
  grantProposal: Proved<Authorized<GrantProposal>>
  grant: Proved<Authorized<Grant>>
}> {
  const grantProposal = grantProposalSchemaProvedAuthorized.parse(
    (
      await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) =>
          eq(permalink, grantProposalSelect.grant_proposal),
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

  if (!grant.permission.selecting) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing selecting permission',
    })
  }

  const timestamp = await getPermalinkSnapshot(grantProposal.grant).then(
    (snapshot) => getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
  )
  if (
    getGrantPhase(new Date(), timestamp, grant.duration) !==
    GrantPhase.PROPOSING
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Not in proposing phase',
    })
  }

  if (
    !(await checkBoolean(
      grant.permission.selecting,
      grantProposalSelect.authorship.author,
      grant.snapshots,
    ))
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Permission denied',
    })
  }

  return { grantProposal, grant }
}
