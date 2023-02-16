import { useCallback } from 'react'

import { requiredCoinTypeOfDidChecker } from '../utils/did'
import { Authorized } from '../utils/schemas/authorship'
import { signDocument } from '../utils/signature'
import { getCurrentSnapshot } from '../utils/snapshot'
import { isTestnet } from '../utils/testnet'
import useWallet from './use-wallet'

export default function useSignDocument<T extends object>(
  did?: string,
): (document: T) => Promise<Authorized<T> | undefined> {
  const { account, signMessage } = useWallet()

  return useCallback(
    async (document: T) => {
      if (!did || !account) {
        return
      }
      try {
        const coinType = requiredCoinTypeOfDidChecker(did)
        const [proof, snapshot] = await Promise.all([
          signDocument(document, account.address, signMessage),
          getCurrentSnapshot(coinType),
        ])
        return {
          ...document,
          authorship: {
            did,
            snapshot: snapshot.toString(),
            coin_type: coinType,
            proof,
            testnet: isTestnet || undefined,
          },
        }
      } catch (err) {
        console.error(err)
      }
    },
    [did, account, signMessage],
  )
}
