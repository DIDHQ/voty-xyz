import { useMemo } from 'react'
import Link from 'next/link'

import useRouterQuery from '../../../hooks/use-router-query'
import { useListProposals } from '../../../hooks/use-api'
import ProposalListItem from '../../../components/proposal-list-item'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import Button from '../../../components/basic/button'

export default function GroupIndexPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: list } = useListProposals(query.entry, query.group)
  const proposals = useMemo(() => list?.flatMap(({ data }) => data), [list])

  return (
    <CommunityLayout>
      <GroupLayout>
        <Link href={`/${query.entry}/${query.group || 0}/create`}>
          <Button primary>New Proposal</Button>
        </Link>
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
