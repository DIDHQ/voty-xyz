import Link from 'next/link'
import { useState } from 'react'
import { Button } from 'react-daisyui'

import ChoiceList from '../components/choice-list'
import Footer from '../components/footer'
import useWallet from '../hooks/use-wallet'

export default function IndexPage() {
  const { account } = useWallet()
  const [choices, setChoices] = useState<string[]>([
    'I have a dream',
    'Doraemon',
    'Beautiful DND',
    'Hello guys',
    'Doraemon',
  ])

  return (
    <>
      {account ? (
        <Link href="/create">
          <Button color="primary">Create an Organization</Button>
        </Link>
      ) : null}
      <ChoiceList disabled={false} value={choices} onChange={setChoices} />
      <Footer />
    </>
  )
}
