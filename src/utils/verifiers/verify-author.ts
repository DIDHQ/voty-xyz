import { verifyMessage } from 'ethers/lib/utils.js'

import { coinTypeToChainId } from '../constants'
import { resolveDid } from '../did'
import { Author } from '../schemas'
import { verifyDocument } from '../signature'
import { isTestnet } from '../testnet'

export default async function verifyAuthor<T extends object>(
  version: 0 | 1,
  document: T & { author: Author },
): Promise<{ author: Author }> {
  const { author, ...rest } = document

  if (coinTypeToChainId[author.coin_type] === undefined) {
    throw new Error(`unsupported author coin type: ${author.coin_type}`)
  }

  if ((author.testnet || false) !== isTestnet) {
    throw new Error('mainnet/testnet mismatch')
  }

  if (
    (await verifyDocument(version, rest, author.proof, verifyMessage)) !==
    author.address
  ) {
    throw new Error('invalid author address')
  }

  const resolved = await resolveDid(author.did, {
    [author.coin_type]: author.snapshot,
  })
  if (
    resolved.coinType !== author.coin_type ||
    resolved.address !== author.address
  ) {
    throw new Error('invalid author snapshot')
  }

  return { author }
}
