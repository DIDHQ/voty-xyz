import { useMemo } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSignMessage,
} from 'wagmi'

import { chainIdToCoinType, coinTypeToChainId } from '../src/constants'
import { formatSignature } from '../src/signature'

export default function useWallet() {
  const account = useAccount()
  const network = useNetwork()
  const { signMessageAsync } = useSignMessage()
  const coinType = useMemo(
    () => (network.chain?.id ? chainIdToCoinType[network.chain.id] : undefined),
    [network.chain?.id],
  )
  const { connect } = useConnect({
    chainId: network.chain?.id,
    connector: account.connector,
  })
  const { disconnect } = useDisconnect()

  return useMemo(
    () => ({
      account:
        coinType && account.address
          ? {
              coinType,
              address: account.address,
            }
          : undefined,
      signMessage: async (message: string | Uint8Array) => {
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
      connect: () => connect(),
      disconnect: () => disconnect(),
    }),
    [account.address, coinType, connect, disconnect, signMessageAsync],
  )
}
