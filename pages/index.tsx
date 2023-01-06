import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from 'react-daisyui'

import Footer from '../components/footer'

const ChoiceList = dynamic(() => import('../components/choice-list'), {
  ssr: false,
})

export default function IndexPage() {
  const handleChoicesChange = (choices: string[]) => {
    console.log('handleChoiceChange', choices)
  }

  return (
    <>
      <Link href="/create">
        <Button color="primary">Create an Organization</Button>
      </Link>
      <Footer />
      <ChoiceList
        // readOnly
        onChoicesChange={handleChoicesChange}
        maxLength={32}
        defaultChoices={[
          'I have a dream',
          'Doraemon',
          'Beautiful DND',
          'Hello guys',
          'Doraemon',
        ]}
      />
    </>
  )
}
