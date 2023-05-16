import type { AppType, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import { Chain, configureChains, createConfig, WagmiConfig } from 'wagmi'
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
  RainbowKitProvider,
  getDefaultWallets,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import { GoogleAnalytics, event } from 'nextjs-google-analytics'

import ShellLayout from '../components/layouts/shell'
import { trpc } from '../utils/trpc'
import { isTestnet, documentTitle } from '../utils/constants'
import { chainIdToRpc } from '../utils/constants'
import '../styles/globals.css'

const { chains, publicClient } = configureChains(
  (isTestnet
    ? [goerli, polygonMumbai, bscTestnet]
    : [mainnet, polygon, bsc]) as Chain[],
  [
    jsonRpcProvider({
      rpc(chain) {
        return { http: chainIdToRpc[chain.id] || '' }
      },
    }),
  ],
)

const { connectors } = getDefaultWallets({
  appName: 'Voty',
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>{documentTitle}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, maximum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <GoogleAnalytics trackPageViews />
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider
          chains={chains}
          modalSize="compact"
          theme={lightTheme({ borderRadius: 'small' })}
        >
          <ShellLayout>
            <Component {...pageProps} />
          </ShellLayout>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}

export default trpc.withTRPC(MyApp)

export function reportWebVitals({
  id,
  name,
  label,
  value,
}: NextWebVitalsMetric) {
  event(name, {
    category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
    value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
    label: id, // id unique to current page load
    nonInteraction: true, // avoids affecting bounce rate.
  })
}
