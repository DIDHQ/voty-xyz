import { TRPCError } from '@trpc/server'

import { Authorized, authorized } from '../schemas/basic/authorship'
import { Group } from '../schemas/group'
import { Proved, proved } from '../schemas/basic/proof'
import { database } from '../database'
import { Community, communitySchema } from '../schemas/community'

const schema = proved(authorized(communitySchema))

export default async function verifyGroup(
  group: Proved<Authorized<Group>>,
): Promise<{
  community: Proved<Authorized<Community>>
}> {
  const storage = await database.storage.findUnique({
    where: { permalink: group.community },
  })
  if (!storage) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Community not found' })
  }
  const community = schema.parse(storage.data)

  if (community.id !== group.authorship.author) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Permission denied',
    })
  }

  return { community }
}
