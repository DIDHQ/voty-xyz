import Link from 'next/link'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'

import useDidConfig from '../../../hooks/use-did-config'
import useRouterQuery from '../../../hooks/use-router-query'
import {
  useRetrieve,
  useListProposals,
  useImport,
} from '../../../hooks/use-api'
import Button from '../../../components/basic/button'
import ProposalListItem from '../../../components/proposal-list-item'
import TextInput from '../../../components/basic/text-input'
import { DataType } from '../../../src/constants'
import useArweaveData from '../../../hooks/use-arweave-data'
import Alert from '../../../components/basic/alert'
import useAsync from '../../../hooks/use-async'
import CommunityAside from '../../../components/community-aside'

export default function GroupIndexPage() {
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
  const router = useRouter()
  const handleCreateGroup = useCallback(() => {
    router.push(`/${query.entry}/${community?.groups?.length || 0}/settings`)
  }, [community?.groups?.length, query.entry, router])

  return community && query.entry ? (
    <>
      <CommunityAside
        entry={query.entry}
        group={query.group ? parseInt(query.group) : undefined}
        community={community}
        className="sticky top-24"
      />
      <main className="flex flex-1">
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
            {group ? (
              <div className="mt-3 flex shrink-0 space-x-4 sm:mt-0 sm:ml-4">
                <Link href={`/${query.entry}/${query.group || 0}/settings`}>
                  <Button>Settings</Button>
                </Link>
                <Link href={`/${query.entry}/${query.group || 0}/create`}>
                  <Button primary>New Proposal</Button>
                </Link>
              </div>
            ) : (
              <TextInput placeholder="Search" className="w-48" />
            )}
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
