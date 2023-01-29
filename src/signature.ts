import arweave from 'arweave'
import { verifyMessage } from 'ethers/lib/utils.js'

import { coinTypeToChainId } from './constants'
import { Author } from './schemas'
import { dataTypeOf } from './utils/data-type'

const signatureEncoding = 'base64'

export function verifySignature(
  message: string,
  author: Pick<Author, 'coin_type' | 'address' | 'signature'>,
): boolean {
  if (coinTypeToChainId[author.coin_type] === undefined) {
    throw new Error(
      `unsupported verify signature coin type: ${author.coin_type}`,
    )
  }
  return (
    verifyMessage(message, Buffer.from(author.signature, signatureEncoding)) ===
    author.address
  )
}

export function formatSignature(buffer: Uint8Array) {
  return Buffer.from(buffer).toString(signatureEncoding)
}

export async function wrapJsonMessage(json: object): Promise<string> {
  const textEncoder = new TextEncoder()
  const data = textEncoder.encode(JSON.stringify(json))
  const buffer = await arweave.crypto.hash(data, 'SHA-256')
  return `You are signing to modify ${dataTypeOf(
    json,
  )} on Voty.\n\nhash: 0x${Buffer.from(buffer).toString('hex')}`
}
