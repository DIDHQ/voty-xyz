import { Authorized, Community, communityWithAuthorSchema } from '../schemas'
import verifyAuthor from './verify-author'

export default async function verifyCommunity(
  json: object,
): Promise<{ community: Authorized<Community> }> {
  const community = communityWithAuthorSchema.safeParse(json)
  if (!community.success) {
    throw new Error(`schema error: ${community.error.message}`)
  }

  await verifyAuthor(community.data)

  return { community: community.data }
}
