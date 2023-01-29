import Link from 'next/link'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { nanoid } from 'nanoid'
import { DocumentCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

import Avatar from '../../components/basic/avatar'
import useArweaveData from '../../hooks/use-arweave-data'
import useDidConfig from '../../hooks/use-did-config'
import {
  Authorized,
  communityWithAuthorSchema,
  Proposal,
} from '../../src/schemas'
import useRouterQuery from '../../hooks/use-router-query'
import { useList } from '../../hooks/use-api'
import { DataType } from '../../src/constants'
import Button from '../../components/basic/button'
import { DiscordIcon, GitHubIcon, TwitterIcon } from '../../components/icons'
import ProposalListItem from '../../components/proposal-list-item'
import TextInput from '../../components/basic/text-input'

export default function CommunityIndexPage() {
  const [query] = useRouterQuery<['did', 'group']>()
  const { data: config } = useDidConfig(query.did)
  const { data: community } = useArweaveData(
    communityWithAuthorSchema,
    config?.community,
  )
  const group = useMemo(
    () => community?.groups?.find(({ id }) => id === query.group),
    [community?.groups, query.group],
  )
  const { data: proposals } = useList<Authorized<Proposal>>(DataType.PROPOSAL, [
    ['did', query.did],
    ['group', query.group],
  ])
  const router = useRouter()
  const handleCreateGroup = useCallback(() => {
    router.push(`/${query.did}/settings?group=${nanoid()}`)
  }, [query.did, router])

  return community ? (
    <main className="flex flex-1 overflow-hidden">
      <aside className="hidden lg:order-first lg:block lg:flex-shrink-0">
        <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="m-8 mb-0 flex items-start">
            <Avatar
              size={16}
              name={query.did}
              value={community.profile.avatar}
            />
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {community.profile.name}
              </h3>
              <p className="text-sm text-gray-500">{community.profile.about}</p>
            </div>
          </div>
          <div className="flex space-x-4 mx-8 my-4">
            {community.profile.website ? (
              <a
                href={community.profile.website}
                className="text-gray-400 hover:text-gray-500"
              >
                <GlobeAltIcon className="w-6 h-6" />
              </a>
            ) : null}
            {community.profile.tos ? (
              <a
                href={community.profile.tos}
                className="text-gray-400 hover:text-gray-500"
              >
                <DocumentCheckIcon className="w-6 h-6" />
              </a>
            ) : null}
            {community.social?.twitter ? (
              <a
                href={`https://twitter.com/${community.social.twitter}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <TwitterIcon className="w-6 h-6" />
              </a>
            ) : null}
            {community.social?.discord ? (
              <a
                href={`https://discord.com/invite/${community.social.discord}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <DiscordIcon className="w-6 h-6" />
              </a>
            ) : null}
            {community.social?.github ? (
              <a
                href={`https://github.com/${community.social.github}`}
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
                key={group.id}
                className={clsx(
                  'relative py-5 px-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600',
                  group.id === query.group
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-white hover:bg-gray-50',
                )}
              >
                <div className="flex justify-between space-x-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${query.did}?group=${group.id}`}
                      className="block focus:outline-none"
                    >
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="truncate text-sm font-medium text-gray-900">
                        {group.profile.name}
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
              {group?.profile.name || 'Proposals'}
            </h3>
            {group ? (
              <div className="mt-1">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {group?.profile.about}
                </p>
              </div>
            ) : null}
          </div>
          {group ? (
            <div className="flex flex-shrink-0 space-x-4 mt-3 sm:mt-0 sm:ml-4">
              <Link href={`/${query.did}/settings?group=${group.id}`}>
                <Button>Settings</Button>
              </Link>
              <Link href={`/${query.did}/proposal/create?group=${group.id}`}>
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
