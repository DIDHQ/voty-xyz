import { useMemo } from 'react'

import { Grid6, GridItem2 } from '../components/basic/grid'
import CommunityCard from '../components/community-card'
import { trpc } from '../utils/trpc'

export default function IndexPage() {
  const { data } = trpc.community.list.useInfiniteQuery({})
  const communities = useMemo(
    () => data?.pages.flatMap(({ data }) => data),
    [data],
  )

  return (
    <Grid6 className="py-6">
      {communities?.map((community) => (
        <GridItem2 key={community.entry.community}>
          <CommunityCard community={community} />
        </GridItem2>
      ))}
    </Grid6>
  )
}
