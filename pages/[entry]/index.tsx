import clsx from 'clsx'
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
  const group = useMemo(
    () =>
      query.group ? community?.groups?.[parseInt(query.group)] : undefined,
    [community?.groups, query.group],
  )
  const { data: list } = useListProposals(query.entry, query.group)
  const proposals = useMemo(() => list?.flatMap(({ data }) => data), [list])

  return community && query.entry ? (
    <>
      <CommunityAside
        entry={query.entry}
        group={query.group ? parseInt(query.group) : undefined}
        community={community}
        className="sticky top-24"
      />
      <main className="flex flex-1 overflow-hidden">
        <section
          aria-labelledby="primary-heading"
          className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:order-last"
        >
          <h1 id="primary-heading" className="sr-only">
            Proposals
          </h1>
          <div
            className={clsx(
              'border-b border-gray-200 bg-white p-5 sm:flex sm:justify-between',
              group ? 'sm:items-start' : 'sm:items-center',
            )}
          >
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {group?.name || 'Proposals'}
              </h3>
              {group ? (
                <div className="mt-1">
                  <p className="text-sm text-gray-600">
                    {group?.extension?.about}
                  </p>
                </div>
              ) : null}
            </div>
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
        </section>
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
