import { resolveDid } from '../did'
import { Author } from '../schemas'
import { verifySignature, wrapDocumentMessage } from '../signature'

export default async function verifyAuthor(
  document: object & { author: Author },
) {
  const { author, ...rest } = document
  const snapshot = BigInt(author.snapshot)
  const { coinType, address } = await resolveDid(author.did, {
    [author.coin_type]: snapshot,
  })
  if (
    coinType !== author.coin_type ||
    address !== author.address ||
    !verifySignature(await wrapDocumentMessage(rest), author)
  ) {
    throw new Error('invalid author')
  }
}
