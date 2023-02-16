import { Authorized } from '../schemas/authorship'
import { Community, communityWithAuthorSchema } from '../schemas/community'
import verifyAuthorship from './verify-authorship'

export default async function verifyCommunity(
  document: object,
): Promise<{ community: Authorized<Community> }> {
  const parsed = communityWithAuthorSchema.safeParse(document)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const community = parsed.data

  await verifyAuthorship(community)

  return { community }
}
