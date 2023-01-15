import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="h-full bg-gray-50">
      <Head>
        <base target="_blank" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <body className="h-full overflow-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
