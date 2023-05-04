import { useCallback } from 'react'

import { requiredCoinTypeOfDidChecker } from '../utils/did'
import { Authorized, Authorship } from '../utils/schemas/basic/authorship'
import { Proved } from '../utils/schemas/basic/proof'
import { signDocument } from '../utils/signature'
import { getCurrentSnapshot } from '../utils/snapshot'
import { isTestnet } from '../utils/constants'
import useWallet from './use-wallet'

export default function useSignDocument(
  did?: string,
  template?: string,
): <T extends object>(document: T) => Promise<Proved<Authorized<T>>> {
  const { account, connect, signMessage } = useWallet()

  return useCallback(
    async (document) => {
      if (!did) {
        throw new Error('Login required')
      }
      if (!account?.address) {
        connect()
        throw new Error('Login required')
      }
      const coinType = requiredCoinTypeOfDidChecker(did)
      const snapshot = await getCurrentSnapshot(coinType)
      const authorship = {
        author: did,
        coin_type: coinType,
        snapshot,
        testnet: isTestnet || undefined,
      } satisfies Authorship
      const proof = await signDocument(
        { ...document, authorship },
        account.address,
        signMessage,
        template,
      )
      return { ...document, authorship, proof }
    },
    [did, connect, account?.address, signMessage, template],
  )
}
