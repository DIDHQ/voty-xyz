import {
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { TwitterIcon, DiscordIcon, GitHubIcon } from './icons'
import { useEntry } from '../hooks/use-api'
import useDidIsMatch from '../hooks/use-did-is-match'
import useRouterQuery from '../hooks/use-router-query'
import useWallet from '../hooks/use-wallet'
import Avatar from './basic/avatar'
import { extractStartEmoji } from '../src/utils/emoji'
import { Group } from '../src/schemas'

export default function CommunityNav(props: { className?: string }) {
  const router = useRouter()
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: community } = useEntry(query.entry)
  const navigation = useMemo(
    () =>
      compact([
        {
          name: 'Timeline',
          href: `/${query.entry}`,
          icon: ClockIcon,
          current: router.pathname === '/[entry]',
        },
        {
          name: 'Settings',
          href: `/${query.entry}/settings`,
          icon: CogIcon,
          current: router.pathname === '/[entry]/settings',
        },
        community?.extension?.about
          ? {
              name: 'About',
              href: `/${query.entry}/about`,
              icon: DocumentTextIcon,
              current: router.pathname === '/[entry]/about',
            }
          : undefined,
      ]),
    [community?.extension?.about, query.entry, router.pathname],
  )
  const externals = useMemo(
    () =>
      community?.extension
        ? compact([
            community.extension.website
              ? { href: community.extension.website, icon: GlobeAltIcon }
              : undefined,
            community.extension.twitter
              ? {
                  href: `https://twitter.com/${community.extension.twitter}`,
                  icon: TwitterIcon,
                }
              : undefined,
            community.extension.discord
              ? {
                  href: `https://discord.com/invite/${community.extension.discord}`,
                  icon: DiscordIcon,
                }
              : undefined,
            community.extension.github
              ? {
                  href: `https://github.com/${community.extension?.github}`,
                  icon: GitHubIcon,
                }
              : undefined,
          ])
        : [],
    [community],
  )
  const { account } = useWallet()
  const { data: isAdmin } = useDidIsMatch(query.entry, account)

  return (
    <aside className={props.className}>
      <div className="flex w-60 flex-col items-center rounded-md border border-gray-200 pb-4">
        <Avatar
          name={query.entry}
          value={community?.extension?.avatar}
          size={20}
          className="mt-8"
        />
        <h3 className="my-4 text-xl font-bold text-gray-900 sm:text-2xl">
          {community?.name || '...'}
        </h3>
        {community ? (
          <>
            <div className="mt-4 w-full space-y-1">
              <h3
                className="px-3 text-sm font-medium text-gray-400"
                id="projects-headline"
              >
                Community
              </h3>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    item.current
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center border-l-4 px-3 py-2 text-sm font-medium',
                  )}
                >
                  <item.icon
                    className={clsx(
                      item.current
                        ? 'text-indigo-500'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 h-6 w-6 shrink-0',
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
            {community?.groups?.length || isAdmin ? (
              <div className="mt-4 w-full">
                <h3
                  className="px-3 text-sm font-medium text-gray-400"
                  id="projects-headline"
                >
                  Groups
                  {isAdmin ? (
                    <Link
                      href={`/${query.entry}/create`}
                      className="float-right"
                    >
                      <PlusIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    </Link>
                  ) : null}
                </h3>
                <div
                  className="mt-1 space-y-1"
                  aria-labelledby="projects-headline"
                >
                  {community?.groups?.map((group, index) => (
                    <GroupListItem
                      key={group.name + index}
                      entry={query.entry}
                      group={group}
                      current={query.group === group.extension.id}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      <div className="my-4 flex space-x-4">
        {externals.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-gray-400 hover:text-gray-500"
          >
            <item.icon className="h-7 w-7" />
          </a>
        ))}
      </div>
    </aside>
  )
}

function GroupListItem(props: {
  entry?: string
  group: Group
  current: boolean
}) {
  const emoji = useMemo(
    () => extractStartEmoji(props.group.name),
    [props.group.name],
  )

  return (
    <Link
      href={`/${props.entry}/${props.group.extension.id}`}
      className={clsx(
        props.current
          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        'group flex items-center border-l-4 px-3 py-2 text-sm font-medium',
      )}
    >
      {emoji ? (
        <span
          className="mr-3 w-6 shrink-0 text-center text-xl"
          aria-hidden="true"
        >
          {emoji}
        </span>
      ) : (
        <UserGroupIcon
          className={clsx(
            props.current
              ? 'text-indigo-500'
              : 'text-gray-400 group-hover:text-gray-500',
            'mr-3 h-6 w-6 shrink-0',
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate">
        {props.group.name.replace(emoji || '', '')}
      </span>
    </Link>
  )
}
