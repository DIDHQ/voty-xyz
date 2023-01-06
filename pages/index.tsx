import Link from 'next/link'
import { Button } from 'react-daisyui'

import Footer from '../components/footer'
import useConnectedSignatureUnit from '../hooks/use-connected-signature-unit'

export default function IndexPage() {
  const connectedSignatureUnit = useConnectedSignatureUnit()

  return (
    <>
      {connectedSignatureUnit ? (
        <Link href="/create">
          <Button color="primary">Create an Organization</Button>
        </Link>
      ) : null}
      <Footer />
    </>
  )
}
