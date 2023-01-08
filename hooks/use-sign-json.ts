import { useCallback } from 'react'

import { Organization, Proposal, Signature, Vote } from '../src/schemas'
import { wrapJsonMessage } from '../src/signature'
import useCurrentSnapshot from './use-current-snapshot'
import useWallet from './use-wallet'

export default function useSignJson<T extends Organization | Proposal | Vote>(
  did: string,
): (json: T) => Promise<(T & { signature: Signature }) | undefined> {
  const { account, signMessage } = useWallet()
  const { data: snapshot } = useCurrentSnapshot(account?.coinType)

  return useCallback(
    async (json: T) => {
      if (!snapshot || !account) {
        return
      }
      const message = await wrapJsonMessage(json)
      const data = await signMessage(message)
      return {
        ...json,
        signature: {
          did,
          snapshot: snapshot.toString(),
          coin_type: account.coinType,
          address: account.address,
          data,
        },
      }
    },
    [snapshot, account, signMessage, did],
  )
}
