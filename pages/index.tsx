import Link from 'next/link'
import ChoiceList from '../components/choice-list'

export default function IndexPage() {
  return (
    <>
      <Link href="/test">test</Link>
      <br />
      <ChoiceList
        defaultChoices={['aaaaa', 'bbbbb', 'ccccc', 'aaaaa', 'bbbbb']}
      />
      <Link href="/ph0ng.bit/settings">settings</Link>
    </>
  )
}
