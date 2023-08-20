import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import Button from '../components/basic/button'

import LoadingBar from '../components/basic/loading-bar'
import CommunityCard from '../components/community-card'
import SubscriptionList from '../components/subscription-list'
import useWallet from '../hooks/use-wallet'
import { trpc } from '../utils/trpc'
import { Container } from '../components/basic/container'
import SectionHeader from '../components/basic/section-header'
import { CommunitySkeleton } from '../components/basic/skeleton'

export default function IndexPage() {
  const { data, isLoading, hasNextPage, fetchNextPage } =
    trpc.community.list.useInfiniteQuery(
      {},
      { getNextPageParam: ({ next }) => next },
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
  const { account } = useWallet()

  return (
    <Container>
      <SubscriptionList 
        className="mb-8"/>
      
      <SectionHeader
        className="mb-5 md:mb-6"
        title="Communities">
        {account ? (
          <Link
            href="/create"
            title="Import Community">
            <Button>
              Import Community
            </Button>
          </Link>
        ) : null}
      </SectionHeader>
      
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {!isLoading ? (
          communities?.map((community) => (
            <CommunityCard 
              key={community.id}
              community={community} />
          ))
        ) : (
          [...Array(3)].map(item => (
            <CommunitySkeleton
              key={item} />
          ))
        )}
      </div>
      
      <LoadingBar loading={isLoading} />
      
      <div ref={ref} />
    </Container>
  )
}