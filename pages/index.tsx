import Link from 'next/link'

import Button from '../components/basic/button'
import useWallet from '../hooks/use-wallet'

export default function IndexPage() {
  const { account } = useWallet()

  return account ? (
    <div className="p-8">
      <Link href="/create">
        <Button primary>New Community</Button>
      </Link>
    </div>
  ) : null
}
