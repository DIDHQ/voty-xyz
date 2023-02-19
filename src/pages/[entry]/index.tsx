import { useMemo } from 'react'

import useRouterQuery from '../../hooks/use-router-query'
import ProposalListItem from '../../components/proposal-list-item'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'

export default function CommunityIndexPage() {
  const query = useRouterQuery<['entry']>()
  const { data: list } = trpc.proposal.list.useInfiniteQuery(query, {
    enabled: !!query.entry,
  })
  const proposals = useMemo(
    () => list?.pages.flatMap(({ data }) => data),
    [list],
  )

  return (
    <CommunityLayout>
      <ul role="list" className="divide-y divide-gray-200">
        {proposals?.map((proposal) => (
          <li key={proposal.permalink}>
            {query.entry ? (
              <ProposalListItem entry={query.entry} value={proposal} />
            ) : null}
          </li>
        ))}
      </ul>
    </CommunityLayout>
  )
}
