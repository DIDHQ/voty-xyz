import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/20/solid'

import useRouterQuery from '../../hooks/use-router-query'
import ProposalListItem from '../../components/proposal-list-item'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import Button from '../../components/basic/button'
import EmptyState from '../../components/empty-state'
import useIsManager from '../../hooks/use-is-manager'

export default function CommunityIndexPage() {
  const query = useRouterQuery<['entry']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isListLoading,
  } = trpc.proposal.list.useInfiniteQuery(
    { entry: query.entry },
    {
      enabled: !!query.entry,
      getNextPageParam: ({ next }) => next,
      refetchOnWindowFocus: false,
    },
  )
  const proposals = useMemo(
    () => data?.pages.flatMap(({ data }) => data),
    [data],
  )
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])
  const isManager = useIsManager(query.entry)

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading || isListLoading} />
      <h3 className="mt-6 text-lg font-medium leading-6 text-gray-900 sm:mt-8">
        Timeline
      </h3>
      {proposals?.length === 0 ? (
        <EmptyState
          title="No events"
          className="mt-24"
          footer={
            community && !community?.workgroups?.length && isManager ? (
              <Link href={`/${query.entry}/create`}>
                <Button primary icon={PlusIcon}>
                  New Workgroup
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ul role="list" className="mt-1 space-y-1">
          {proposals?.map((proposal) => (
            <li key={proposal.permalink}>
              {query.entry ? <ProposalListItem proposal={proposal} /> : null}
            </li>
          ))}
        </ul>
      )}
      <div ref={ref} />
    </CommunityLayout>
  )
}
