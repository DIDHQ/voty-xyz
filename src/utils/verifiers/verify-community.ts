import { Authorized, authorized } from '../schemas/authorship'
import { Community, communitySchema } from '../schemas/community'
import { proved, Proved } from '../schemas/proof'

export default async function verifyCommunity(
  document: object,
): Promise<{ community: Proved<Authorized<Community>> }> {
  const parsed = proved(authorized(communitySchema)).safeParse(document)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const community = parsed.data

  return { community }
}
