import type { AppType, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import { Poppins } from 'next/font/google'
import { GoogleAnalytics, event } from 'nextjs-google-analytics'
import { Provider } from 'jotai'
import dynamic from 'next/dynamic'
import ShellLayout from '../components/layouts/shell'
import { trpc } from '../utils/trpc'
import {
  documentTitle,
  documentDescription,
  documentImage,
  domain,
  twitterHandle,
} from '../utils/constants'
import { store } from '../utils/atoms'
import '../styles/globals.css'
import '../styles/editor.css'

const WalletBridgeProvider = dynamic(
  () => import('../components/wallet-bridge-provider'),
  {
    ssr: false,
  },
)

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
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
      <style jsx global>
        {`
          html {
            font-family: ${poppins.style.fontFamily};
          }
        `}
      </style>
      <GoogleAnalytics trackPageViews />
      <WalletBridgeProvider>
        <Provider store={store}>
          <ShellLayout>
            <Component {...pageProps} />
          </ShellLayout>
        </Provider>
      </WalletBridgeProvider>
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
