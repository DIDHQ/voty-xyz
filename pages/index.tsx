import Link from 'next/link'

import Footer from '../components/footer'

export default function IndexPage() {
  return (
    <>
      <Link href="/test">test</Link>
      <br />
      <Link href="/ph0ng.bit/settings">settings</Link>
      <Footer />
    </>
  )
}
