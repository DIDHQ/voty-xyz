import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import type { AppProps } from 'next/app'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { IconProvider, DEFAULT_ICON_CONFIGS } from '@icon-park/react'
import { useDarkMode } from 'usehooks-ts'
import { useTheme } from 'react-daisyui'
import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import Head from 'next/head'

import Layout from '../components/layout'
import '../styles/globals.css'
import { persistentThemeAtom } from '../src/atoms'

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
  const { isDarkMode } = useDarkMode()
  const { setTheme } = useTheme()
  const persistentTheme = useAtomValue(persistentThemeAtom)
  useEffect(() => {
    const theme =
      persistentTheme === 'auto'
        ? isDarkMode
          ? 'dark'
          : 'light'
        : persistentTheme
    document.getElementsByTagName('html')[0].setAttribute('data-theme', theme)
    setTheme(theme)
  }, [isDarkMode, setTheme, persistentTheme])

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
