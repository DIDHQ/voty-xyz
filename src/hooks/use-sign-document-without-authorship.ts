import { useCallback } from 'react'

import { Proved } from '../utils/schemas/proof'
import { signDocument } from '../utils/signature'
import useWallet from './use-wallet'

export default function useSignDocumentWithoutAuthorship(
  template?: string,
): <T extends { community_id: string; subscribe: boolean }>(
  document: T,
) => Promise<Proved<T>> {
  const { account, connect, signMessage } = useWallet()

  return useCallback(
    async (document) => {
      if (!account?.address) {
        connect()
        throw new Error('Login required')
      }

      const proof = await signDocument(
        document,
        account.address,
        signMessage,
        template,
      )
      return { ...document, proof }
    },
    [account?.address, connect, signMessage, template],
  )
}
