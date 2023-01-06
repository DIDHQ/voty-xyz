import Link from 'next/link'
import { Button } from 'react-daisyui'

import Footer from '../components/footer'
import useWallet from '../hooks/use-wallet'

export default function IndexPage() {
  const { account } = useWallet()

  return (
    <>
      {account ? (
        <Link href="/create">
          <Button color="primary">Create an Organization</Button>
        </Link>
      ) : null}
      <Footer />
    </>
  )
}
