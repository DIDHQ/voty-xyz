import { TRPCError } from '@trpc/server'

import { checkBoolean } from '../functions/boolean'
import { Authorized, authorized } from '../schemas/authorship'
import { Group, groupSchema } from '../schemas/group'
import { Proved, proved } from '../schemas/proof'
import { GroupProposal } from '../schemas/group-proposal'
import { database } from '../database'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'

const schema = proved(authorized(groupSchema))

export default async function verifyGroupProposal(
  groupProposal: Proved<Authorized<GroupProposal>>,
): Promise<{
  group: Proved<Authorized<Group>>
}> {
  const [timestamp, storage] = await Promise.all([
    getPermalinkSnapshot(groupProposal.group).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    database.storage.findUnique({ where: { permalink: groupProposal.group } }),
  ])
  if (!timestamp || !storage) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Group not found' })
  }
  const group = schema.parse(storage.data)

  if (
    !(await checkBoolean(
      group.permission.proposing,
      groupProposal.authorship.author,
      groupProposal.snapshots,
    ))
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Permission denied',
    })
  }

  return { group }
}
