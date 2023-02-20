import { useCallback } from 'react'

import { requiredCoinTypeOfDidChecker } from '../utils/did'
import { Authorized, Authorship } from '../utils/schemas/authorship'
import { Proved } from '../utils/schemas/proof'
import { signDocument } from '../utils/signature'
import { getCurrentSnapshot } from '../utils/snapshot'
import { isTestnet } from '../utils/testnet'
import useWallet from './use-wallet'

export default function useSignDocument(
  did?: string,
): <T extends object>(
  document: T,
) => Promise<Proved<Authorized<T>> | undefined> {
  const { account, signMessage } = useWallet()

  return useCallback(
    async (document) => {
      if (!did || !account) {
        return
      }
      try {
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
        )
        return { ...document, authorship, proof }
      } catch (err) {
        console.error(err)
      }
    },
    [did, account, signMessage],
  )
}
