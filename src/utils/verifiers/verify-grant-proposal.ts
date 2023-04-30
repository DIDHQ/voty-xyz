import { TRPCError } from '@trpc/server'

import { checkBoolean } from '../functions/boolean'
import { Authorized, authorized } from '../schemas/authorship'
import { Grant, grantSchema } from '../schemas/grant'
import { Proved, proved } from '../schemas/proof'
import { GrantProposal } from '../schemas/grant-proposal'
import { database } from '../database'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'

const schema = proved(authorized(grantSchema))

export default async function verifyGrantProposal(
  grantProposal: Proved<Authorized<GrantProposal>>,
): Promise<{
  grant: Proved<Authorized<Grant>>
}> {
  const [timestamp, storage] = await Promise.all([
    getPermalinkSnapshot(grantProposal.grant).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    database.storage.findUnique({ where: { permalink: grantProposal.grant } }),
  ])
  if (!timestamp || !storage) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Grant not found' })
  }
  const grant = schema.parse(storage.data)

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
