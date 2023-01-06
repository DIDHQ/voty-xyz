import Link from 'next/link'
import { Button } from 'react-daisyui'

import Footer from '../components/footer'

export default function IndexPage() {
  return (
    <>
      <Link href="/create">
        <Button color="primary">Create an Organization</Button>
      </Link>
      <Footer />
    </>
  )
}
