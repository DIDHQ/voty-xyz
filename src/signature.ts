import arweave from 'arweave'
import { verifyMessage } from 'ethers/lib/utils.js'
import { coinTypeToChainId } from './constants'
import { Signature } from './schemas'

export function verifySignature(
  message: string,
  signature: Pick<Signature, 'coin_type' | 'address' | 'sig'>,
): boolean {
  if (coinTypeToChainId[signature.coin_type] === undefined) {
    throw new Error(
      `unsupported verify signature coin type: ${signature.coin_type}`,
    )
  }
  return (
    verifyMessage(message, Buffer.from(signature.sig, 'base64')) ===
    signature.address
  )
}

export function formatSignature(buffer: Uint8Array) {
  return Buffer.from(buffer).toString('base64')
}

export async function wrapJsonMessage(
  action: 'edit organization',
  json: object,
): Promise<string> {
  const textEncoder = new TextEncoder()
  const data = textEncoder.encode(JSON.stringify(json))
  const buffer = await arweave.crypto.hash(data, 'SHA-256')
  return `You are signing to ${action} on Voty.\n\nhash: ${Buffer.from(
    buffer,
  ).toString('base64')}`
}
