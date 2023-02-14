import { sha256 } from 'ethers/lib/utils.js'

import { Author } from './schemas'
import { Proof } from './types'

export async function signDocument(
  document: object,
  signMessage: (message: string) => Buffer | Promise<Buffer>,
): Promise<Proof> {
  const message = encodeDocument(document)
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
  const message = encodeDocument(document)
  return verifyMessage(message, Buffer.from(proof.replace(/^1:/, ''), 'base64'))
}

function encodeDocument(document: object & { author?: Author }): string {
  const { author, ...rest } = document
  const textEncoder = new TextEncoder()
  const data = textEncoder.encode(JSON.stringify(rest))
  return `You are signing for Voty Protocol.\n\nhash: ${sha256(data)}`
}
