import { Authorized, Community, communityWithAuthorSchema } from '../schemas'
import verifyAuthor from './verify-author'

export default async function verifyCommunity(
  json: object,
): Promise<{ community: Authorized<Community> }> {
  const parsed = communityWithAuthorSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const community = parsed.data

  await verifyAuthor(community)

  return { community }
}
