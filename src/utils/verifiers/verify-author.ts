import { verifyMessage } from 'ethers/lib/utils.js'

import { checkDidAuthor } from '../did'
import { Author } from '../schemas'
import { verifyDocument } from '../signature'
import { isTestnet } from '../testnet'

export default async function verifyAuthor<T extends object>(
  document: T & { author: Author },
): Promise<{ author: Author }> {
  const { author, ...rest } = document

  if ((author.testnet || false) !== isTestnet) {
    throw new Error('mainnet/testnet mismatch')
  }

  if (!(await verifyDocument(rest, author.proof, verifyMessage))) {
    throw new Error('invalid author address')
  }

  if (!(await checkDidAuthor(author))) {
    throw new Error('proof of did is invalid')
  }

  return { author }
}
