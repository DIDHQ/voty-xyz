import { TRPCError } from '@trpc/server'

import { Authorized, authorized } from '../schemas/basic/authorship'
import { Group } from '../schemas/v1/group'
import { Proved, proved } from '../schemas/basic/proof'
import { database } from '../database'
import { Community, communitySchema } from '../schemas/v1/community'

const communitySchemaProvedAuthorized = proved(authorized(communitySchema))

export default async function verifyGroup(
  group: Proved<Authorized<Group>>,
): Promise<{
  community: Proved<Authorized<Community>>
}> {
  const community = communitySchemaProvedAuthorized.parse(
    (
      await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, group.community),
      })
    )?.data,
  )

  if (community.id !== group.authorship.author) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Permission denied',
    })
  }

  return { community }
}
