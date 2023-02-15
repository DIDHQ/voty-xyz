import { useCallback } from 'react'

import { coinTypeToChainId } from '../utils/constants'
import {
  Community,
  Proposal,
  Option,
  Vote,
  Authorized,
  Author,
} from '../utils/schemas'
import { signDocument } from '../utils/signature'
import { getCurrentSnapshot } from '../utils/snapshot'
import useWallet from './use-wallet'

export default function useSignDocument<
  T extends Community | Proposal | Option | Vote,
>(did: string): (document: T) => Promise<Authorized<T> | undefined> {
  const { account, signMessage } = useWallet()

  return useCallback(
    async (document: T) => {
      if (!account) {
        return
      }
      try {
        if (coinTypeToChainId[account.coinType]) {
          const [proof, snapshot] = await Promise.all([
            signDocument(1, document, signMessage),
            getCurrentSnapshot(account.coinType),
          ])
          return {
            ...document,
            author: {
              did,
              snapshot: snapshot.toString(),
              coin_type: account.coinType,
              address: account.address,
              proof,
            } satisfies Author,
          }
        }
      } catch (err) {
        console.error(err)
      }
    },
    [account, signMessage, did],
  )
}
