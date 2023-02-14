import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <base target="_blank" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
