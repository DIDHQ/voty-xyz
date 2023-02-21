import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import ProposalListItem from '../../../components/proposal-list-item'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'

export default function GroupIndexPage() {
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: list, isInitialLoading } = trpc.proposal.list.useInfiniteQuery(
    { entry: query.entry, workgroup: query.workgroup },
    {
      enabled: !!query.entry && !!query.workgroup,
      refetchOnWindowFocus: false,
    },
  )
  const proposals = useMemo(
    () => list?.pages.flatMap(({ data }) => data),
    [list],
  )

  return (
    <CommunityLayout>
      <WorkgroupLayout>
        <LoadingBar loading={isInitialLoading} />
        {proposals?.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500 sm:pl-6">No proposals</p>
        ) : (
          <ul role="list" className="divide-y divide-gray-200 sm:pl-6">
            {proposals?.map((proposal) => (
              <li key={proposal.permalink}>
                {query.entry ? (
                  <ProposalListItem entry={query.entry} proposal={proposal} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </WorkgroupLayout>
    </CommunityLayout>
  )
}
