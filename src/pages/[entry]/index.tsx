import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { DocumentPlusIcon } from '@heroicons/react/20/solid'

import useRouterQuery from '../../hooks/use-router-query'
import ProposalListItem from '../../components/proposal-list-item'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import Button from '../../components/basic/button'

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

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading || isListLoading} />
      <h3 className="mt-6 text-lg font-medium leading-6 text-gray-900">
        Activities
      </h3>
      {proposals?.length === 0 ? (
        community?.workgroups?.length === 0 ? (
          <div className="mx-auto mt-6 py-20 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              Create workgroup
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Workgroup is the hub of proposals
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Link href={`/${query.entry}/create`}>
                <Button primary icon={DocumentPlusIcon}>
                  Create
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-gray-500">No events</p>
        )
      ) : (
        <ul role="list" className="divide-y divide-gray-200">
          {proposals?.map((proposal) => (
            <li key={proposal.permalink}>
              {query.entry ? (
                <ProposalListItem entry={query.entry} proposal={proposal} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <div ref={ref} />
    </CommunityLayout>
  )
}
