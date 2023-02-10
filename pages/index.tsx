import { useMemo } from 'react'

import CommunityCard from '../components/community-card'
import { useListCommunities } from '../hooks/use-api'

export default function IndexPage() {
  const { data } = useListCommunities()
  const communities = useMemo(() => data?.flatMap(({ data }) => data), [data])

  return (
    <div className="space-y-6 py-8">
      {communities?.map((community) => (
        <CommunityCard key={community.uri} community={community} />
      ))}
    </div>
  )
}
