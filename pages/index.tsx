import Link from 'next/link'
import { Button } from 'react-daisyui'

import ChoiceList from '../components/choice-list'
import Footer from '../components/footer'
import useWallet from '../hooks/use-wallet'

export default function IndexPage() {
  const { account } = useWallet()
  const handleChoicesChange = (choices: string[]) => {
    console.log('handleChoiceChange', choices)
  }

  return (
    <>
      {account ? (
        <Link href="/create">
          <Button color="primary">Create an Organization</Button>
        </Link>
      ) : null}
      <Footer />
      <ChoiceList
        // disabled
        onChoicesChange={handleChoicesChange}
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
