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
import { Analytics } from '@vercel/analytics/react'
import 'react-tooltip/dist/react-tooltip.css'
import '@total-typescript/ts-reset'

import ShellLayout from '../components/layouts/shell'
import { trpc } from '../utils/trpc'
import { isTestnet, documentTitle } from '../utils/constants'
import { chainIdToRpc } from '../utils/constants'
import '../styles/globals.css'

const { chains, provider } = configureChains(
  (isTestnet
    ? [goerli, polygonMumbai, bscTestnet]
    : [mainnet, polygon, bsc]) as Chain[],
  [
    jsonRpcProvider({
      rpc(chain) {
        return { http: chainIdToRpc[chain.id] || '' }
      },
      static: true,
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
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider modalSize="compact" chains={chains} theme={theme}>
          <ShellLayout>
            <Component {...pageProps} />
          </ShellLayout>
        </RainbowKitProvider>
      </WagmiConfig>
      <Analytics />
    </>
  )
}

export default trpc.withTRPC(MyApp)
