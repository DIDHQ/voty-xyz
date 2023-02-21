import { useMemo } from 'react'

import useRouterQuery from '../../hooks/use-router-query'
import ProposalListItem from '../../components/proposal-list-item'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'

export default function CommunityIndexPage() {
  const query = useRouterQuery<['entry']>()
  const { data: list, isLoading } = trpc.proposal.list.useInfiniteQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const proposals = useMemo(
    () => list?.pages.flatMap(({ data }) => data),
    [list],
  )

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      {proposals?.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 sm:pl-6">No events</p>
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
    </CommunityLayout>
  )
}
