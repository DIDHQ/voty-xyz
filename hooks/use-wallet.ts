import { useMemo } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useNetwork,
  useSignMessage,
} from 'wagmi'
import useSWR from 'swr'
import { KeyInfo } from 'dotbit/lib/fetchers/BitIndexer.type'
import { createInstance } from 'dotbit'
import { BitPluginAvatar } from '@dotbit/plugin-avatar'

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
  const { data, error } = useSWR(
    coinType !== undefined && account.address
      ? ['reverse', coinType, account.address, network.chain?.id]
      : null,
    async () => {
      const dotbit = createInstance()
      dotbit.installPlugin(new BitPluginAvatar())
      const bit = await dotbit.reverse({
        coin_type: coinType!.toString(),
        key: account.address,
      } as KeyInfo)
      return {
        avatar: (await bit.avatar())?.url,
        name: bit.account,
      }
    },
  )
  const { data: ensAvatar } = useEnsAvatar(account)
  const { data: ensName } = useEnsName(account)

  return useMemo(
    () => ({
      account:
        coinType && account.address
          ? {
              coinType,
              address: account.address,
            }
          : undefined,
      avatar: data?.avatar || ensAvatar || undefined,
      name: data?.name || ensName || undefined,
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
    [
      coinType,
      account.address,
      data?.avatar,
      data?.name,
      ensAvatar,
      ensName,
      signMessageAsync,
      connect,
      disconnect,
    ],
  )
}
