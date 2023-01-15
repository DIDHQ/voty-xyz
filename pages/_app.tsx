import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import type { AppProps } from 'next/app'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import Head from 'next/head'

import Layout from '../components/layout'
import '../styles/globals.css'

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
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}
