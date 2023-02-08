import { useMemo, useState } from 'react'
import Link from 'next/link'

import useRouterQuery from '../../../hooks/use-router-query'
import { useListProposals } from '../../../hooks/use-api'
import ProposalListItem from '../../../components/proposal-list-item'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import Button from '../../../components/basic/button'
import Select from '../../../components/basic/select'

export default function GroupIndexPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: list } = useListProposals(query.entry, query.group)
  const proposals = useMemo(() => list?.flatMap(({ data }) => data), [list])
  const [order, setOrder] = useState('All')

  return (
    <CommunityLayout>
      <GroupLayout>
        <div className="sticky top-44 -mt-2 flex w-full justify-between bg-white pl-6 pt-6 pb-4">
          <Select
            options={['All', 'Active', 'Pending', 'Closed']}
            value={order}
            onChange={setOrder}
            className="w-36 shrink-0"
          />
          <Link href={`/${query.entry}/${query.group || 0}/create`}>
            <Button primary>New Proposal</Button>
          </Link>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {proposals?.map((proposal) => (
            <li key={proposal.uri}>
              {query.entry ? (
                <ProposalListItem entry={query.entry} value={proposal} />
              ) : null}
            </li>
          ))}
        </ul>
      </GroupLayout>
    </CommunityLayout>
  )
}
