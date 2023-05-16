import { VerifyMessageParameters, VerifyMessageReturnType } from 'viem'

import { Proof } from './schemas/basic/proof'
import { getAddress, keccak256 } from './sdks/ethers'

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
    parameters: VerifyMessageParameters,
  ) => Promise<VerifyMessageReturnType>,
): Promise<boolean> {
  if (proof.type !== 'eth_personal_sign') {
    return false
  }
  const message = encodeDocument(document, proof.template)
  return verifyMessage({
    message,
    address: proof.address as `0x${string}`,
    signature: Buffer.from(proof.signature, 'base64'),
  })
}

function encodeDocument(
  document: object & { proof?: Proof },
  template?: string,
): string {
  const { proof, ...rest } = document
  const textEncoder = new TextEncoder()
  return template
    ? template.replace(
        '{keccak256}',
        keccak256(textEncoder.encode(JSON.stringify(rest))),
      )
    : JSON.stringify(rest)
}
