import arweave from 'arweave'
import { verifyMessage } from 'ethers/lib/utils.js'

import { coinTypeToChainId } from './constants'
import { Signature } from './schemas'

const signatureEncoding = 'base64'

export enum SignatureTarget {
  ORGANIZATION = 'organization',
  PROPOSAL = 'proposal',
}

export function verifySignature(
  message: string,
  signature: Pick<Signature, 'coin_type' | 'address' | 'data'>,
): boolean {
  if (coinTypeToChainId[signature.coin_type] === undefined) {
    throw new Error(
      `unsupported verify signature coin type: ${signature.coin_type}`,
    )
  }
  return (
    verifyMessage(message, Buffer.from(signature.data, signatureEncoding)) ===
    signature.address
  )
}

export function formatSignature(buffer: Uint8Array) {
  return Buffer.from(buffer).toString(signatureEncoding)
}

export async function wrapJsonMessage(
  target: SignatureTarget,
  json: object,
): Promise<string> {
  const textEncoder = new TextEncoder()
  const data = textEncoder.encode(JSON.stringify(json))
  const buffer = await arweave.crypto.hash(data, 'SHA-256')
  return `You are signing to modify ${target} on Voty.\n\nhash: 0x${Buffer.from(
    buffer,
  ).toString('hex')}`
}
