import { VerifyMessageReturnType } from 'viem'
import { Proof } from './schemas/basic/proof'
import { keccak256 } from './sdks/ethers'

export async function signDocument(
  document: object,
  address: string,
  signMessage: (message: string) => Promise<string>,
  coinType: string,
  backup_addr?: string,
  template?: string,
): Promise<Proof> {
  const message = encodeDocument(document, template)
  const signature = await signMessage(message)
  return {
    type: coinType,
    address,
    template,
    backup_addr,
    signature,
  }
}

export async function verifyDocument(
  document: object,
  proof: Proof,
  verifyMessage: (
    parameters: {
      address: string
      message: string
      signature: string
    },
  ) => Promise<VerifyMessageReturnType>,
): Promise<boolean> {
  const message = encodeDocument(document, proof.template)
  console.log('server signature', proof)
  const result = await verifyMessage({
    message,
    address: proof.address,
    signature: proof.signature,
  })
  return result
}

function encodeDocument(
  document: object & { proof?: Proof },
  template?: string,
): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { proof: _omitted, ...rest } = document
  const textEncoder = new TextEncoder()
  return template
    ? template.replace(
      '{keccak256}',
      keccak256(textEncoder.encode(JSON.stringify(rest))),
    )
    : JSON.stringify(rest)
}
