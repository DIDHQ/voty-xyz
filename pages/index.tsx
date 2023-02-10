import { useMemo } from 'react'

import { Grid6, GridItem2 } from '../components/basic/grid'
import CommunityCard from '../components/community-card'
import { useListCommunities } from '../hooks/use-api'

export default function IndexPage() {
  const { data } = useListCommunities()
  const communities = useMemo(() => data?.flatMap(({ data }) => data), [data])

  return (
    <Grid6 className="py-6">
      {communities?.map((community) => (
        <GridItem2 key={community.permalink}>
          <CommunityCard community={community} />
        </GridItem2>
      ))}
    </Grid6>
  )
}
