import { useMemo, useState } from 'react'

import useRouterQuery from '../../hooks/use-router-query'
import { useListProposals } from '../../hooks/use-api'
import ProposalListItem from '../../components/proposal-list-item'
import CommunityLayout from '../../components/layouts/community'
import Select from '../../components/basic/select'

export default function CommunityIndexPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: list } = useListProposals(query.entry, query.group)
  const proposals = useMemo(() => list?.flatMap(({ data }) => data), [list])
  const [order, setOrder] = useState('All')

  return (
    <CommunityLayout>
      <Select
        options={['All', 'Active', 'Pending', 'Closed']}
        value={order}
        onChange={setOrder}
        className="m-6 mb-2 w-36 shrink-0"
      />
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
