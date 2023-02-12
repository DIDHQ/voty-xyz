import { useCallback } from 'react'
import { coinTypeToChainId } from '../src/constants'

import {
  Community,
  Proposal,
  Option,
  Vote,
  Authorized,
  Author,
} from '../src/schemas'
import { signDocument } from '../src/signature'
import { getCurrentSnapshot } from '../src/snapshot'
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
      if (coinTypeToChainId[account.coinType]) {
        const [proof, snapshot] = await Promise.all([
          signDocument(document, signMessage),
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
      throw new Error(`unsupported signing coin type: ${account.coinType}`)
    },
    [account, signMessage, did],
  )
}
