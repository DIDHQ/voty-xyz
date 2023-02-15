import { sha256 } from 'ethers/lib/utils.js'

import { Author } from './schemas'
import { Proof } from './types'

export async function signDocument(
  version: 0 | 1,
  document: object,
  signMessage: (message: string) => Buffer | Promise<Buffer>,
): Promise<Proof> {
  const message = encodeDocument(version, document)
  const buffer = await signMessage(message)
  return `${version}:${buffer.toString('base64')}`
}

export async function verifyDocument(
  version: 0 | 1,
  document: object,
  proof: Proof,
  verifyMessage: (
    message: string,
    signature: Buffer,
  ) => string | Promise<string>,
): Promise<string> {
  const message = encodeDocument(version, document)
  return verifyMessage(
    message,
    Buffer.from(proof.replace(`\^${version}:`, ''), 'base64'),
  )
}

function encodeDocument(
  version: 0 | 1,
  document: object & { author?: Author },
): string {
  const { author, ...rest } = document
  const textEncoder = new TextEncoder()
  const data = JSON.stringify(rest)
  if (version === 0) {
    return data
  }
  if (version === 1) {
    return `You are signing for Voty Protocol.\n\nhash: ${sha256(
      textEncoder.encode(data),
    )}`
  }
  throw new Error('unsupported version')
}
