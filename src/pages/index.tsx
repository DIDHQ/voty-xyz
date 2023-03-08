import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import Button from '../components/basic/button'

import { Grid6, GridItem2 } from '../components/basic/grid'
import LoadingBar from '../components/basic/loading-bar'
import CommunityCard from '../components/community-card'
import SubscriptionList from '../components/subscription-list'
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
      <SubscriptionList />
      <Link href="/create" className="float-right mt-6 sm:mt-8">
        <Button primary icon={PlusIcon}>
          Community
        </Button>
      </Link>
      <h2 className="mt-7 text-xl font-semibold sm:mt-9">Communities</h2>
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
