import Link from 'next/link'
import { useMemo } from 'react'

import Button from '../components/basic/button'
import { useListCommunities } from '../hooks/use-api'
import useWallet from '../hooks/use-wallet'

export default function IndexPage() {
  const { account } = useWallet()
  const { data } = useListCommunities()
  const communities = useMemo(() => data?.flatMap(({ data }) => data), [data])

  return account ? (
    <div className="p-8">
      <Link href="/create">
        <Button primary>New Community</Button>
      </Link>
      <ul>
        {communities?.map((community) => (
          <li key={community.id}>{community.name}</li>
        ))}
      </ul>
    </div>
  ) : null
}
