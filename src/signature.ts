import { verifyMessage } from 'ethers/lib/utils.js'
import { coin_type_to_chain_id } from './constants'
import { Signature } from './schemas'

export function verifySignature(
  message: string,
  signature: Pick<Signature, 'coin_type' | 'address' | 'sig'>,
): boolean {
  if (coin_type_to_chain_id[signature.coin_type] === undefined) {
    throw new Error(
      `unsupported verify signature coin_type: ${signature.coin_type}`,
    )
  }
  return (
    verifyMessage(message, Buffer.from(signature.sig, 'base64')) ===
    signature.address
  )
}
