import { verifyMessage } from 'ethers/lib/utils.js'

import { checkDidAuthor } from '../did'
import { Authorship } from '../schemas/authorship'
import { verifyDocument } from '../signature'
import { isTestnet } from '../testnet'

export default async function verifyAuthorship<T extends object>(
  document: T & { authorship: Authorship },
): Promise<{ authorship: Authorship }> {
  const { authorship, ...rest } = document

  if ((authorship.testnet || false) !== isTestnet) {
    throw new Error('mainnet/testnet mismatch')
  }

  if (!(await verifyDocument(rest, authorship.proof, verifyMessage))) {
    throw new Error('invalid author address')
  }

  if (!(await checkDidAuthor(authorship))) {
    throw new Error('proof of did is invalid')
  }

  return { authorship }
}
