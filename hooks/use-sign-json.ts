import { useCallback } from 'react'

import { Community, Proposal, Vote, Authorized } from '../src/schemas'
import { wrapJsonMessage } from '../src/signature'
import { getCurrentSnapshot } from '../src/snapshot'
import useWallet from './use-wallet'

export default function useSignJson<T extends Community | Proposal | Vote>(
  did: string,
): (json: T) => Promise<Authorized<T> | undefined> {
  const { account, signMessage } = useWallet()

  return useCallback(
    async (json: T) => {
      if (!account) {
        return
      }
      const [signature, snapshot] = await Promise.all([
        wrapJsonMessage(json).then(signMessage),
        getCurrentSnapshot(account.coinType),
      ])
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
    [account, signMessage, did],
  )
}
