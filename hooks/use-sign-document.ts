import { useCallback } from 'react'

import { Community, Proposal, Option, Vote, Authorized } from '../src/schemas'
import { wrapDocumentMessage } from '../src/signature'
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
      const [signature, snapshot] = await Promise.all([
        wrapDocumentMessage(document).then(signMessage),
        getCurrentSnapshot(account.coinType),
      ])
      return {
        ...document,
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
