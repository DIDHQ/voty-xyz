import Link from 'next/link'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { nanoid } from 'nanoid'
import { GlobeAltIcon } from '@heroicons/react/24/outline'

import Avatar from '../../components/basic/avatar'
import useDidConfig from '../../hooks/use-did-config'
import useRouterQuery from '../../hooks/use-router-query'
import { useCommunity, useListProposals } from '../../hooks/use-api'
import Button from '../../components/basic/button'
import { DiscordIcon, GitHubIcon, TwitterIcon } from '../../components/icons'
import ProposalListItem from '../../components/proposal-list-item'
import TextInput from '../../components/basic/text-input'

export default function CommunityIndexPage() {
  const [query] = useRouterQuery<['did', 'group']>()
  const { data: config } = useDidConfig(query.did)
  const { data: community } = useCommunity(config?.community)
  const group = useMemo(
    () =>
      community?.groups?.find(({ extension: { id } }) => id === query.group),
    [community?.groups, query.group],
  )
  const { data } = useListProposals(query.did, query.group)
  const proposals = useMemo(() => data?.flatMap(({ data }) => data), [data])
  const router = useRouter()
  const handleCreateGroup = useCallback(() => {
    router.push(`/${query.did}/settings?group=${nanoid()}`)
  }, [query.did, router])

  return community?.extension ? (
    <main className="flex flex-1 overflow-hidden">
      <aside className="hidden lg:order-first lg:block lg:flex-shrink-0">
        <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="m-8 mb-0 flex items-start">
            <Avatar
              size={16}
              name={query.did}
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
          <div className="flex space-x-4 mx-8 my-4">
            {community.extension.website ? (
              <a
                href={community.extension.website}
                className="text-gray-400 hover:text-gray-500"
              >
                <GlobeAltIcon className="w-6 h-6" />
              </a>
            ) : null}
            {community.extension?.twitter ? (
              <a
                href={`https://twitter.com/${community.extension.twitter}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <TwitterIcon className="w-6 h-6" />
              </a>
            ) : null}
            {community.extension?.discord ? (
              <a
                href={`https://discord.com/invite/${community.extension.discord}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <DiscordIcon className="w-6 h-6" />
              </a>
            ) : null}
            {community.extension?.github ? (
              <a
                href={`https://github.com/${community.extension.github}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <GitHubIcon className="w-6 h-6" />
              </a>
            ) : null}
          </div>
          <div className="flex space-x-4 mx-8">
            <Link href={`/${query.did}/settings`}>
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
                    href={`/${query.did}`}
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
            {community.groups?.map((group) => (
              <li
                key={group.extension.id}
                className={clsx(
                  'relative py-5 px-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600',
                  group.extension.id === query.group
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-white hover:bg-gray-50',
                )}
              >
                <div className="flex justify-between space-x-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${query.did}?group=${group.extension.id}`}
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
                    className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
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
            'p-5 bg-white border-b border-gray-200 pb-5 sm:flex sm:justify-between',
            group ? 'sm:items-start' : 'sm:items-center',
          )}
        >
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {group?.name || 'Proposals'}
            </h3>
            {group ? (
              <div className="mt-1">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {group?.extension?.about}
                </p>
              </div>
            ) : null}
          </div>
          {group ? (
            <div className="flex flex-shrink-0 space-x-4 mt-3 sm:mt-0 sm:ml-4">
              <Link href={`/${query.did}/settings?group=${group.extension.id}`}>
                <Button>Settings</Button>
              </Link>
              <Link
                href={`/${query.did}/proposal/create?group=${group.extension.id}`}
              >
                <Button primary>New Proposal</Button>
              </Link>
            </div>
          ) : (
            <TextInput placeholder="Search" className="w-48" />
          )}
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {proposals?.map((proposal) => (
            <li key={proposal.id}>
              {query.did ? (
                <ProposalListItem did={query.did} value={proposal} />
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  ) : null
}
