import { useMemo } from 'react'

import useDidConfig from '../../hooks/use-did-config'
import useRouterQuery from '../../hooks/use-router-query'
import { useRetrieve, useListProposals, useImport } from '../../hooks/use-api'
import ProposalListItem from '../../components/proposal-list-item'
import { DataType } from '../../src/constants'
import useArweaveData from '../../hooks/use-arweave-data'
import Alert from '../../components/basic/alert'
import useAsync from '../../hooks/use-async'
import CommunityAside from '../../components/community-aside'

export default function CommunityIndexPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: config } = useDidConfig(query.entry)
  const { data } = useArweaveData(DataType.COMMUNITY, config?.community)
  const handleImport = useAsync(useImport(config?.community))
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)
  const { data: list } = useListProposals(query.entry, query.group)
  const proposals = useMemo(() => list?.flatMap(({ data }) => data), [list])

  return community && query.entry ? (
    <>
      <CommunityAside
        entry={query.entry}
        group={query.group ? parseInt(query.group) : undefined}
        community={community}
        className="fixed top-20"
      />
      <main className="flex flex-1 overflow-hidden pl-64 pt-4">
        <ul role="list" className="divide-y divide-gray-200">
          {proposals?.map((proposal) => (
            <li key={proposal.uri}>
              {query.entry ? (
                <ProposalListItem entry={query.entry} value={proposal} />
              ) : null}
            </li>
          ))}
        </ul>
      </main>
    </>
  ) : data ? (
    <Alert
      type="info"
      text="This community exists on the blockchain, but not imported into Voty."
      action="Import"
      onClick={handleImport.execute}
      className="mt-4"
    />
  ) : null
}
