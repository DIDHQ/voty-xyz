import { getAddress, sha256 } from 'ethers/lib/utils.js'

import { Proof } from './schemas/proof'

export async function signDocument(
  document: object,
  address: string,
  signMessage: (message: string) => Buffer | Promise<Buffer>,
): Promise<Proof> {
  const message = encodeDocument(document)
  const buffer = await signMessage(message)
  return {
    type: 'eth_personal_sign',
    address: getAddress(address),
    signature: buffer.toString('base64'),
  }
}

export async function verifyDocument(
  document: object,
  proof: Proof,
  verifyMessage: (
    message: string,
    signature: Buffer,
  ) => string | Promise<string>,
): Promise<boolean> {
  const message = encodeDocument(document)
  const address = await verifyMessage(
    message,
    Buffer.from(proof.signature, 'base64'),
  )
  return proof.address === address
}

function encodeDocument(document: object & { proof?: Proof }): string {
  const { proof, ...rest } = document
  const textEncoder = new TextEncoder()
  return `You are signing for Voty Protocol.\n\nhash: ${sha256(
    textEncoder.encode(JSON.stringify(rest)),
  )}`
}
