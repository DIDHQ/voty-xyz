import type { AppType, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import { GoogleAnalytics, event } from 'nextjs-google-analytics'

import ShellLayout from '../components/layouts/shell'
import { trpc } from '../utils/trpc'
import { documentTitle } from '../utils/constants'
import '../styles/globals.css'
import '../styles/editor.css'

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
      <ShellLayout>
        <Component {...pageProps} />
      </ShellLayout>
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
