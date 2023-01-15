import Link from 'next/link'

import Button from '../components/basic/button'

export default function IndexPage() {
  return (
    <div className="p-8">
      <Link href="/create">
        <Button primary>Create an Organization</Button>
      </Link>
    </div>
  )
}
