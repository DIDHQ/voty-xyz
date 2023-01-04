import { useCallback } from 'react'
import { useSignMessage as useWagmiSignMessage } from 'wagmi'

export default function useSignMessage() {
  const { signMessageAsync } = useWagmiSignMessage()

  return useCallback(
    async (message: string | Uint8Array) => {
      return Buffer.from(
        (
          await signMessageAsync({
            message,
          })
        ).substring(2),
        'hex',
      ).toString('base64')
    },
    [signMessageAsync],
  )
}
