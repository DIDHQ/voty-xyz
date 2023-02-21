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
import { useQuery } from '@tanstack/react-query'
import { KeyInfo } from 'dotbit/lib/fetchers/BitIndexer.type'
import { BitNetwork, createInstance, DefaultConfig } from 'dotbit'
import { BitPluginAvatar } from '@dotbit/plugin-avatar'

import { chainIdToCoinType, coinTypeToChainId } from '../utils/constants'
import { isTestnet } from '../utils/constants'

const dotbit = createInstance(
  DefaultConfig[isTestnet ? BitNetwork.testnet : BitNetwork.mainnet],
)

dotbit.installPlugin(new BitPluginAvatar())

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
  const { data: bit } = useQuery(
    ['reverse', coinType, account.address],
    async () => {
      const bit = await dotbit.reverse({
        coin_type: coinType!.toString(),
        key: account.address,
      } as KeyInfo)
      return {
        avatar: (await bit?.avatar())?.url,
        did: bit?.account,
      }
    },
    {
      enabled: coinType !== undefined && !!account.address,
      refetchOnWindowFocus: false,
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
      name: bit?.did || ensName || undefined,
      avatar: bit?.avatar || ensAvatar || undefined,
      displayAddress: account.address
        ? `${account.address.substring(0, 5)}...${account.address.substring(
            38,
          )}`
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
          return signature
        }
        throw new Error(`sign message unsupported coin type: ${coinType}`)
      },
      connect: () => connect(),
      disconnect: () => disconnect(),
    }),
    [
      coinType,
      account.address,
      bit?.avatar,
      bit?.did,
      ensAvatar,
      ensName,
      signMessageAsync,
      connect,
      disconnect,
    ],
  )
}
