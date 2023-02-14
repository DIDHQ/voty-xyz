import arweave from 'arweave'

import { Author } from './schemas'
import { Proof } from './types'

export async function signDocument(
  document: object,
  signMessage: (message: string) => Buffer | Promise<Buffer>,
): Promise<Proof> {
  const message = await encodeDocument(document)
  const buffer = await signMessage(message)
  return `1:${buffer.toString('base64')}`
}

export async function verifyDocument(
  document: object,
  proof: Proof,
  verifyMessage: (
    message: string,
    signature: Buffer,
  ) => string | Promise<string>,
): Promise<string> {
  const message = await encodeDocument(document)
  return verifyMessage(message, Buffer.from(proof.replace(/^1:/, ''), 'base64'))
}

async function encodeDocument(
  document: object & { author?: Author },
): Promise<string> {
  const { author, ...rest } = document
  const textEncoder = new TextEncoder()
  const data = textEncoder.encode(JSON.stringify(rest))
  const buffer = await arweave.crypto.hash(data, 'SHA-256')
  return `You are signing for Voty Protocol.\n\nhash: 0x${Buffer.from(
    buffer,
  ).toString('hex')}`
}
