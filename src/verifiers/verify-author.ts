import { resolveDid } from '../did'
import { Author } from '../schemas'
import { verifySignature, wrapJsonMessage } from '../signature'

export default async function verifyAuthor(json: object & { author: Author }) {
  const { author, ...rest } = json
  const snapshot = BigInt(author.snapshot)
  const { coinType, address } = await resolveDid(author.did, {
    [author.coin_type]: snapshot,
  })
  if (
    coinType !== author.coin_type ||
    address !== author.address ||
    !verifySignature(await wrapJsonMessage(rest), author)
  ) {
    throw new Error('invalid author')
  }
}
