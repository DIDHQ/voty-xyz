import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

import useRouterQuery from '../../../hooks/use-router-query'
import ProposalListItem from '../../../components/proposal-list-item'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import EmptyState from '../../../components/empty-state'

export default function GroupIndexPage() {
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.proposal.list.useInfiniteQuery(
      { entry: query.entry, workgroup: query.workgroup },
      {
        enabled: !!query.entry && !!query.workgroup,
        getNextPageParam: ({ next }) => next,
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
      <WorkgroupLayout>
        <LoadingBar loading={isLoading} />
        {proposals?.length === 0 ? (
          <EmptyState title="No proposals" className="mt-24" />
        ) : (
          <ul role="list" className="mt-1 space-y-1">
            {proposals?.map((proposal) => (
              <li key={proposal.permalink}>
                <ProposalListItem proposal={proposal} />
              </li>
            ))}
          </ul>
        )}
        <div ref={ref} />
      </WorkgroupLayout>
    </CommunityLayout>
  )
}
