import { Html, Head, Main, NextScript } from 'next/document'

import { description, documentTitle, domain } from '../utils/constants'

export default function MyDocument() {
  return (
    <Html lang="en">
      <Head>
        <base target="_blank" />
        <meta name="referrer" content="no-referrer" />

        <meta name="application-name" content={documentTitle} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content={documentTitle} />
        <meta name="description" content={description} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/touch-icon-ipad.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/touch-icon-iphone-retina.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/touch-icon-ipad-retina.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/api/manifest.json" />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#22C493"
        />
        <link rel="shortcut icon" href="/icons/favicon.ico" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={documentTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${domain}/images/og.png`} />
        <meta name="twitter:creator" content="@voty_xyz" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={documentTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content={documentTitle} />
        <meta property="og:url" content={domain} />
        <meta property="og:image" content={`${domain}/images/og.png`} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
