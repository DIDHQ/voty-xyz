import { useCallback } from 'react'

import { Proved } from '../utils/schemas/proof'
import { signDocument } from '../utils/signature'
import useWallet from './use-wallet'

export default function useSignDocumentWithoutAuthorship(
  template?: string,
): <T extends object>(document: T) => Promise<Proved<T> | undefined> {
  const { account, connect, signMessage } = useWallet()

  return useCallback(
    async (document) => {
      if (!account?.address) {
        connect()
        return
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
