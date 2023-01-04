import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import type { AppProps } from 'next/app'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { IconProvider, DEFAULT_ICON_CONFIGS } from '@icon-park/react'
import { useDarkMode } from 'usehooks-ts'
import { useTheme } from 'react-daisyui'
import { useEffect } from 'react'

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

// We use 1.5rem for all SVG icons to ensure compatibility with daisyUI
const iconConfig = { ...DEFAULT_ICON_CONFIGS, size: '1.5rem' }

export default function App({ Component, pageProps }: AppProps) {
  const isDarkMode = useDarkMode()
  const { setTheme } = useTheme()
  useEffect(() => {
    setTheme(isDarkMode ? 'dark' : 'light')
  }, [isDarkMode, setTheme])

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <IconProvider value={iconConfig}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </IconProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
