import { Authorized, authorized } from '../schemas/authorship'
import { Community, communitySchema } from '../schemas/community'
import verifyAuthorship from './verify-authorship'

export default async function verifyCommunity(
  document: object,
): Promise<{ community: Authorized<Community> }> {
  const parsed = authorized(communitySchema).safeParse(document)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const community = parsed.data

  await verifyAuthorship(community)

  return { community }
}
