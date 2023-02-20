import { Authorized, authorized } from '../schemas/authorship'
import { Community, communitySchema } from '../schemas/community'
import { proved, Proved } from '../schemas/proof'

export default async function verifyCommunity(
  document: object,
): Promise<{ community: Proved<Authorized<Community>> }> {
  const community = proved(authorized(communitySchema)).parse(document)

  return { community }
}
