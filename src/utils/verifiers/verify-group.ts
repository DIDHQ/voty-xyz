import { TRPCError } from '@trpc/server'

import { Authorized, authorized } from '../schemas/authorship'
import { Group } from '../schemas/group'
import { Proved, proved } from '../schemas/proof'
import { database } from '../database'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'
import { Community, communitySchema } from '../schemas/community'

const schema = proved(authorized(communitySchema))

export default async function verifyGroup(
  group: Proved<Authorized<Group>>,
): Promise<{
  community: Proved<Authorized<Community>>
}> {
  const [timestamp, data] = await Promise.all([
    getPermalinkSnapshot(group.community).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    database.storage.findUnique({ where: { permalink: group.community } }),
  ])
  if (!timestamp || !data) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Community not found' })
  }
  const community = schema.parse(data.data)

  return { community }
}
