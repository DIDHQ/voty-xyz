import { useCallback } from 'react'
import { useSignMessage as useWagmiSignMessage } from 'wagmi'
import { coinTypeToChainId } from '../src/constants'
import { formatSignature } from '../src/signature'

export default function useSignMessage(coinType?: number) {
  const { signMessageAsync } = useWagmiSignMessage()

  return useCallback(
    async (message: string | Uint8Array) => {
      if (coinType && coinTypeToChainId[coinType]) {
        const signature = Buffer.from(
          (
            await signMessageAsync({
              message,
            })
          ).substring(2),
          'hex',
        )
        return formatSignature(signature)
      }
      throw new Error(`sign message unsupported coin type: ${coinType}`)
    },
    [coinType, signMessageAsync],
  )
}
