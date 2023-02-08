import { useMemo } from 'react'

import useRouterQuery from '../../hooks/use-router-query'
import { useListProposals } from '../../hooks/use-api'
import ProposalListItem from '../../components/proposal-list-item'
import CommunityLayout from '../../components/layouts/community'

export default function CommunityIndexPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: list } = useListProposals(query.entry, query.group)
  const proposals = useMemo(() => list?.flatMap(({ data }) => data), [list])

  return (
    <CommunityLayout>
      <ul role="list" className="divide-y divide-gray-200">
        {proposals?.map((proposal) => (
          <li key={proposal.uri}>
            {query.entry ? (
              <ProposalListItem entry={query.entry} value={proposal} />
            ) : null}
          </li>
        ))}
      </ul>
    </CommunityLayout>
  )
}
