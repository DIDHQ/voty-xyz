import { resolveDid } from '../did'
import { communityWithAuthorSchema } from '../schemas'
import { verifySignature, wrapJsonMessage } from '../signature'

export default async function verifyCommunity(json: object) {
  // verify schema
  const communityWithAuthor = communityWithAuthorSchema.safeParse(json)
  if (!communityWithAuthor.success) {
    throw new Error(`schema error: ${communityWithAuthor.error.message}`)
  }

  // verify author
  const { author, ...community } = communityWithAuthor.data
  const snapshot = BigInt(author.snapshot)
  const { coinType, address } = await resolveDid(author.did, {
    [author.coin_type]: snapshot,
  })
  if (
    coinType !== author.coin_type ||
    address !== author.address ||
    !verifySignature(await wrapJsonMessage(community), author)
  ) {
    throw new Error('invalid author')
  }
}
