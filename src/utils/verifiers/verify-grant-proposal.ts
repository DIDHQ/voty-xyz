import { TRPCError } from '@trpc/server'

import { checkBoolean } from '../functions/boolean'
import { Authorized, authorized } from '../schemas/basic/authorship'
import { Grant, grantSchema } from '../schemas/v1/grant'
import { Proved, proved } from '../schemas/basic/proof'
import { GrantProposal } from '../schemas/v1/grant-proposal'
import { database } from '../database'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'
import { GrantPhase, getGrantPhase } from '../phase'

const grantSchemaProvedAuthorized = proved(authorized(grantSchema))

export default async function verifyGrantProposal(
  grantProposal: Proved<Authorized<GrantProposal>>,
  ignorePhase?: boolean,
): Promise<{
  grant: Proved<Authorized<Grant>>
}> {
  const grant = grantSchemaProvedAuthorized.parse(
    (
      await database.storage.findUnique({
        where: { permalink: grantProposal.grant },
      })
    )?.data,
  )

  const timestamp = await getPermalinkSnapshot(grantProposal.grant).then(
    (snapshot) => getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
  )
  if (
    !ignorePhase &&
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
      grant.permission.proposing,
      grantProposal.authorship.author,
      grant.snapshots,
    ))
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Permission denied',
    })
  }

  return { grant }
}
