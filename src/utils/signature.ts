import { Proof } from './schemas/proof'
import { getAddress, sha256 } from './sdks/ethers'

export async function signDocument(
  document: object,
  address: string,
  signMessage: (message: string) => Buffer | Promise<Buffer>,
  template?: string,
): Promise<Proof> {
  const message = encodeDocument(document, template)
  const buffer = await signMessage(message)
  return {
    type: 'eth_personal_sign',
    address: getAddress(address),
    template,
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
  if (proof.type !== 'eth_personal_sign') {
    return false
  }
  const message = encodeDocument(document, proof.template)
  const address = await verifyMessage(
    message,
    Buffer.from(proof.signature, 'base64'),
  )
  return proof.address === address
}

function encodeDocument(
  document: object & { proof?: Proof },
  template?: string,
): string {
  const { proof, ...rest } = document
  const textEncoder = new TextEncoder()
  return template
    ? template.replace(
        '{sha256}',
        sha256(textEncoder.encode(JSON.stringify(rest))),
      )
    : JSON.stringify(rest)
}
