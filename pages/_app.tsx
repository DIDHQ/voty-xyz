import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import type { AppProps } from 'next/app'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { IconProvider, DEFAULT_ICON_CONFIGS } from '@icon-park/react'
import Head from 'next/head'
import '../styles/globals.css'

import Layout from '../components/layout'

const { chains, provider } = configureChains(
  [mainnet, polygon, bsc],
  [publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: 'Voty',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <IconProvider value={DEFAULT_ICON_CONFIGS}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </IconProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}
