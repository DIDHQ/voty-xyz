import { useMemo } from 'react'

import { Grid6, GridItem2 } from '../components/basic/grid'
import LoadingBar from '../components/basic/loading-bar'
import CommunityCard from '../components/community-card'
import { trpc } from '../utils/trpc'

export default function IndexPage() {
  const { data, isInitialLoading } = trpc.community.list.useInfiniteQuery({})
  const communities = useMemo(
    () => data?.pages.flatMap(({ data }) => data),
    [data],
  )

  return (
    <>
      <LoadingBar loading={isInitialLoading} />
      <Grid6 className="w-full py-6">
        {communities?.map((community) => (
          <GridItem2 key={community.entry.community}>
            <CommunityCard community={community} />
          </GridItem2>
        ))}
      </Grid6>
    </>
  )
}
