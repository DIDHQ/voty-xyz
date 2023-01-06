import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from 'react-daisyui'

import Footer from '../components/footer'

const ChoiceList = dynamic(() => import('../components/choice-list'), {
  ssr: false,
})

export default function IndexPage() {
  const [choices, setChoices] = useState<string[]>([
    'I have a dream',
    'Doraemon',
    'Beautiful DND',
    'Hello guys',
    'Doraemon',
  ])

  return (
    <>
      <Link href="/create">
        <Button color="primary">Create an Organization</Button>
      </Link>
      {choices.join(', ')}
      <ChoiceList disabled={false} value={choices} onChange={setChoices} />
      <Footer />
    </>
  )
}
