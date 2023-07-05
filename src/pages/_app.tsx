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
  connectorsForWallets,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import {
  walletConnectWallet,
  trustWallet,
  metaMaskWallet,
  injectedWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { GoogleAnalytics, event } from 'nextjs-google-analytics'

import ShellLayout from '../components/layouts/shell'
import { trpc } from '../utils/trpc'
import {
  isTestnet,
  documentTitle,
  chainIdToRpc,
  documentDescription,
  documentImage,
  domain,
  twitterHandle,
} from '../utils/constants'
import '../styles/globals.css'
import '../styles/editor.css'

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

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!

const connectors = connectorsForWallets([
  {
    groupName: 'Popular',
    wallets: [
      metaMaskWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
    ],
  },
  {
    groupName: 'Other',
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ projectId, chains }),
      coinbaseWallet({ appName: documentTitle, chains }),
    ],
  },
])

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
        <meta name="description" content={documentDescription} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={documentTitle} />
        <meta name="twitter:description" content={documentDescription} />
        <meta name="twitter:image" content={documentImage} />
        <meta name="twitter:creator" content={`@${twitterHandle}`} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:title" property="og:title" content={documentTitle} />
        <meta
          key="og:description"
          property="og:description"
          content={documentDescription}
        />
        <meta
          key="og:site_name"
          property="og:site_name"
          content={documentTitle}
        />
        <meta key="og:url" property="og:url" content={domain} />
        <meta key="og:image" property="og:image" content={documentImage} />

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
