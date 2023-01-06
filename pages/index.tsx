import Link from 'next/link'
import ChoiceList from '../components/choice-list'

export default function IndexPage() {
  const handleChoicesChange = (choices: string[]) => {
    console.log('handleChoiceChange', choices)
  }
  return (
    <>
      <Link href="/test">test</Link>
      <br />
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
      <Link href="/ph0ng.bit/settings">settings</Link>
    </>
  )
}
