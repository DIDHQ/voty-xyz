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
