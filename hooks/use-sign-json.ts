import { useCallback } from 'react'

import { Community, Proposal, Vote, Authorized } from '../src/schemas'
import { wrapJsonMessage } from '../src/signature'
import useCurrentSnapshot from './use-current-snapshot'
import useWallet from './use-wallet'

export default function useSignJson<T extends Community | Proposal | Vote>(
  did: string,
): (json: T) => Promise<Authorized<T> | undefined> {
  const { account, signMessage } = useWallet()
  const { data: snapshot } = useCurrentSnapshot(account?.coinType)

  return useCallback(
    async (json: T) => {
      if (!snapshot || !account) {
        return
      }
      const message = await wrapJsonMessage(json)
      const signature = await signMessage(message)
      return {
        ...json,
        author: {
          did,
          snapshot: snapshot.toString(),
          coin_type: account.coinType,
          address: account.address,
          signature,
        },
      }
    },
    [snapshot, account, signMessage, did],
  )
}
