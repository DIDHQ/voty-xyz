import Link from 'next/link'
import { useMemo } from 'react'

import { useListCommunities } from '../hooks/use-api'
import useWallet from '../hooks/use-wallet'

export default function IndexPage() {
  const { account } = useWallet()
  const { data } = useListCommunities()
  const communities = useMemo(() => data?.flatMap(({ data }) => data), [data])

  return account ? (
    <div className="py-8">
      <ul>
        {communities?.map((community) => (
          <Link key={community.uri} href={`/${community.author.did}`}>
            <li>{community.name}</li>
          </Link>
        ))}
      </ul>
    </div>
  ) : null
}
