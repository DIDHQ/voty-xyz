import { useCallback } from 'react'
import { useSignMessage } from 'wagmi'
import { wrapJsonMessage } from '../src/signature'

export default function useSignJson() {
  const { signMessageAsync } = useSignMessage()

  return useCallback(
    async (data: object) => {
      return Buffer.from(
        (
          await signMessageAsync({
            message: await wrapJsonMessage('edit organization', data),
          })
        ).substring(2),
        'hex',
      ).toString('base64')
    },
    [signMessageAsync],
  )
}
