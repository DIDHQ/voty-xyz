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

// We use 1.5rem for all SVG icons to ensure compatibility with daisyUI
const iconConfig = { ...DEFAULT_ICON_CONFIGS, size: '1.5rem' }

export default function App({ Component, pageProps }: AppProps) {
  const { isDarkMode } = useDarkMode()
  const { setTheme } = useTheme()
  const persistentTheme = useAtomValue(persistentThemeAtom)
  useEffect(() => {
    const t = persistentTheme || (isDarkMode ? 'dark' : 'light')
    document.getElementsByTagName('html')[0].setAttribute('data-theme', t)
    setTheme(t)
  }, [isDarkMode, setTheme, persistentTheme])

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
