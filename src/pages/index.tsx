import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

import { Grid6, GridItem2 } from '../components/basic/grid'
import LoadingBar from '../components/basic/loading-bar'
import CommunityCard from '../components/community-card'
import { trpc } from '../utils/trpc'

export default function IndexPage() {
  const { data, isLoading, hasNextPage, fetchNextPage } =
    trpc.community.list.useInfiniteQuery(
      {},
      { getNextPageParam: ({ next }) => next, refetchOnWindowFocus: false },
    )
  const communities = useMemo(
    () => data?.pages.flatMap(({ data }) => data),
    [data],
  )
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])

  return (
    <div className="w-full">
      <h2 className="mt-8 text-xl font-semibold">Communities</h2>
      <Grid6 className="w-full py-6">
        {communities?.map((community) => (
          <GridItem2 key={community.entry.community}>
            <CommunityCard community={community} />
          </GridItem2>
        ))}
      </Grid6>
      <LoadingBar loading={isLoading} />
      <div ref={ref} />
    </div>
  )
}
