import { useCallback } from 'react'

import { coinTypeToChainId } from '../utils/constants'
import { Authorized, Author } from '../utils/schemas'
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
        if (coinTypeToChainId[account.coinType]) {
          const [proof, snapshot] = await Promise.all([
            signDocument(document, account.address, signMessage),
            getCurrentSnapshot(account.coinType),
          ])
          return {
            ...document,
            author: {
              did,
              snapshot: snapshot.toString(),
              coin_type: account.coinType,
              proof,
              testnet: isTestnet || undefined,
            } satisfies Author,
          }
        }
      } catch (err) {
        console.error(err)
      }
    },
    [did, account, signMessage],
  )
}
