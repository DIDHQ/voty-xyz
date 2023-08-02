import { TRPCError } from '@trpc/server'

import { Authorized, authorized } from '../schemas/basic/authorship'
import { Grant } from '../schemas/v1/grant'
import { Proved, proved } from '../schemas/basic/proof'
import { database } from '../database'
import { Community, communitySchema } from '../schemas/v1/community'

const communitySchemaProvedAuthorized = proved(authorized(communitySchema))

export default async function verifyGrant(
  grant: Proved<Authorized<Grant>>,
): Promise<{
  community: Proved<Authorized<Community>>
}> {
  const community = communitySchemaProvedAuthorized.parse(
    (
      await database.query.storage.findFirst({
        where: ({ permalink }, { eq }) => eq(permalink, grant.community),
      })
    )?.data,
  )

  if (community.id !== grant.authorship.author) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Permission denied',
    })
  }

  return { community }
}
