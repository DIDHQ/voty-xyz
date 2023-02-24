import type { AppType } from 'next/app'
import Head from 'next/head'
import { Chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import {
  mainnet,
  goerli,
  polygon,
  polygonMumbai,
  bsc,
  bscTestnet,
} from 'wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import {
  connectorsForWallets,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { useMemo } from 'react'
import 'react-tooltip/dist/react-tooltip.css'
import '@total-typescript/ts-reset'

import ShellLayout from '../components/layouts/shell'
import { trpc } from '../utils/trpc'
import { isTestnet, documentTitle } from '../utils/constants'
import { chainIdToRpc } from '../utils/constants'
import '../../styles/globals.css'

const { chains, provider } = configureChains(
  (isTestnet
    ? [goerli, polygonMumbai, bscTestnet]
    : [mainnet, polygon, bsc]) as Chain[],
  [
    jsonRpcProvider({
      rpc(chain) {
        return { http: chainIdToRpc[chain.id] }
      },
    }),
  ],
)

const wallets = [
  injectedWallet({ chains, shimDisconnect: true }),
  metaMaskWallet({ chains, shimDisconnect: true }),
  walletConnectWallet({ chains }),
]

const connectors = connectorsForWallets([{ groupName: 'Voty', wallets }])

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const MyApp: AppType = ({ Component, pageProps }) => {
  const theme = useMemo(
    () => lightTheme({ borderRadius: 'small', fontStack: 'system' }),
    [],
  )

  return (
    <>
      <Head>
        <title>{documentTitle}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider modalSize="compact" chains={chains} theme={theme}>
          <ShellLayout>
            <Component {...pageProps} />
          </ShellLayout>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}

export default trpc.withTRPC(MyApp)
