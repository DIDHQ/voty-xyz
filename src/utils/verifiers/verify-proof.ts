import { TRPCError } from '@trpc/server'
import { verifyEvmMessage } from '@didhq/did-utils/verify-message/evm'
import { verifyTronMessage } from '@didhq/did-utils/verify-message/tron'
import { Hex } from 'viem'
import { Proved } from '../schemas/basic/proof'
import { verifyDocument } from '../signature'
import { commonCoinTypes, isTestnet } from '../constants'

const endPoint = isTestnet
    ? 'https://test-webauthn-api.did.id'
    : 'https://webauthn-api.did.id'

const verifyPasskey = (
  address: string,
  backup_addr: string,
  message: string,
  signature: string
) =>
  fetch(`${endPoint}/v1/webauthn/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      master_addr: address,
      backup_addr,
      msg: message,
      signature: signature,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json()
      }
      throw new Error('Invalid signature')
    })
    .then((v) => {
      if (v.err_no !== 0) {
        throw new Error('Invalid signature')
      }
      return v.data.is_valid
    })
    .catch(() => false)

export default async function verifyProof<T extends object>(
  document: Proved<T>,
): Promise<void> {
  const { proof, ...rest } = document
  const verifyMessage = async ({ message }: { message: string }) => {
    const signature = atob(proof.signature)
    if (proof.type === commonCoinTypes.ETH.toString()) {
      return verifyEvmMessage(proof.address, message, signature as Hex)
    }
    if (proof.type === commonCoinTypes.TRX.toString()) {
      return verifyTronMessage(proof.address, message, signature as Hex)
    }
    if(proof.type === commonCoinTypes.CKB.toString()) {
      return verifyPasskey(proof.address, proof.backup_addr!, message, signature as Hex)
    }
    return false
  }
  if (!(await verifyDocument(rest, proof, verifyMessage))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid proof' })
  }
}
