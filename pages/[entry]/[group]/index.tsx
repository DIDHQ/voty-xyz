import Link from 'next/link'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { GlobeAltIcon } from '@heroicons/react/24/outline'

import Avatar from '../../../components/basic/avatar'
import useDidConfig from '../../../hooks/use-did-config'
import useRouterQuery from '../../../hooks/use-router-query'
import {
  useRetrieve,
  useListProposals,
  useImport,
} from '../../../hooks/use-api'
import Button from '../../../components/basic/button'
import { DiscordIcon, GitHubIcon, TwitterIcon } from '../../../components/icons'
import ProposalListItem from '../../../components/proposal-list-item'
import TextInput from '../../../components/basic/text-input'
import { DataType } from '../../../src/constants'
import useArweaveData from '../../../hooks/use-arweave-data'
import Alert from '../../../components/basic/alert'
import useAsync from '../../../hooks/use-async'

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

  return community?.extension ? (
    <main className="flex flex-1">
      <aside className="hidden lg:order-first lg:block lg:shrink-0">
        <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="m-8 mb-0 flex items-start">
            <Avatar
              size={16}
              name={query.entry}
              value={community.extension.avatar}
            />
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {community.name}
              </h3>
              <p className="text-sm text-gray-500">
                {community.extension.about}
              </p>
            </div>
          </div>
          <div className="mx-8 my-4 flex space-x-4">
            {community.extension.website ? (
              <a
                href={community.extension.website}
                className="text-gray-400 hover:text-gray-500"
              >
                <GlobeAltIcon className="h-6 w-6" />
              </a>
            ) : null}
            {community.extension?.twitter ? (
              <a
                href={`https://twitter.com/${community.extension.twitter}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <TwitterIcon className="h-6 w-6" />
              </a>
            ) : null}
            {community.extension?.discord ? (
              <a
                href={`https://discord.com/invite/${community.extension.discord}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <DiscordIcon className="h-6 w-6" />
              </a>
            ) : null}
            {community.extension?.github ? (
              <a
                href={`https://github.com/${community.extension.github}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <GitHubIcon className="h-6 w-6" />
              </a>
            ) : null}
          </div>
          <div className="mx-8 flex space-x-4">
            <Link href={`/${query.entry}/settings`}>
              <Button>Settings</Button>
            </Link>
            <Button onClick={handleCreateGroup}>New Group</Button>
          </div>
          <ul role="list" className="mt-4 divide-y divide-gray-200">
            <li
              className={clsx(
                'relative py-5 px-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600',
                !query.group
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-white hover:bg-gray-50',
              )}
            >
              <div className="flex justify-between space-x-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${query.entry}`}
                    className="block focus:outline-none"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="truncate text-sm font-medium text-gray-900">
                      Proposals
                    </p>
                  </Link>
                </div>
              </div>
            </li>
            {community.groups?.map((group, index) => (
              <li
                key={index}
                className={clsx(
                  'relative py-5 px-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600',
                  query.group && index === parseInt(query.group)
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-white hover:bg-gray-50',
                )}
              >
                <div className="flex justify-between space-x-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${query.entry}/${index}`}
                      className="block focus:outline-none"
                    >
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="truncate text-sm font-medium text-gray-900">
                        {group.name}
                      </p>
                    </Link>
                  </div>
                  {/* <time
                    dateTime={group.datetime}
                    className="shrink-0 whitespace-nowrap text-sm text-gray-500"
                  >
                    {group.time}
                  </time> */}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
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
