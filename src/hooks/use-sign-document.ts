import { useCallback } from 'react'

import { requiredCoinTypeOfDidChecker } from '../utils/did'
import { Authorized, Authorship } from '../utils/schemas/basic/authorship'
import { Proved } from '../utils/schemas/basic/proof'
import { signDocument } from '../utils/signature'
import { getCurrentSnapshot } from '../utils/snapshot'
import { isTestnet } from '../utils/constants'
import { Snapshots } from '../utils/types'
import useWallet from './use-wallet'

export default function useSignDocument(
  did?: string,
  template?: string,
  snapshots?: Snapshots,
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
      const snapshot =
        snapshots?.[coinType] || (await getCurrentSnapshot(coinType))
      const authorship = isTestnet
        ? ({
            author: did,
            coin_type: coinType,
            snapshot,
            testnet: true,
          } satisfies Authorship)
        : ({
            author: did,
            coin_type: coinType,
            snapshot,
          } satisfies Authorship)
      const proof = await signDocument(
        { ...document, authorship },
        account.address,
        signMessage,
        account.coinType,
        account?.deviceAddress,
        template,
        
      )
      return { ...document, authorship, proof }
    },
    [did, account?.address, snapshots, signMessage, template, connect, account?.coinType, account?.deviceAddress],
  )
}
