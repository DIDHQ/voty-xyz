import { useMemo } from 'react'

import CommunityCard from '../components/community-card'
import { useListCommunities } from '../hooks/use-api'
import useWallet from '../hooks/use-wallet'

export default function IndexPage() {
  const { account } = useWallet()
  const { data } = useListCommunities()
  const communities = useMemo(() => data?.flatMap(({ data }) => data), [data])

  return account ? (
    <div className="py-8">
      {communities?.map((community) => (
        <CommunityCard key={community.uri} community={community} />
      ))}
    </div>
  ) : null
}
