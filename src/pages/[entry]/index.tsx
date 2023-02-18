import { useMemo, useState } from 'react'

import useRouterQuery from '../../hooks/use-router-query'
import ProposalListItem from '../../components/proposal-list-item'
import CommunityLayout from '../../components/layouts/community'
import Select from '../../components/basic/select'
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
  const [order, setOrder] = useState('All')

  return (
    <CommunityLayout>
      <div className="sticky top-16 flex w-full justify-between border-b border-gray-200 bg-white/80 py-6 pl-6 backdrop-blur">
        <Select
          options={['All', 'Active', 'Pending', 'Closed']}
          value={order}
          onChange={setOrder}
          className="w-36 shrink-0"
        />
      </div>
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
