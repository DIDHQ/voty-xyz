import {
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import dynamic from 'next/dynamic'

import { TwitterIcon, DiscordIcon, GitHubIcon } from './icons'
import useRouterQuery from '../hooks/use-router-query'
import Avatar from './basic/avatar'
import { extractStartEmoji } from '../utils/emoji'
import { Group } from '../utils/schemas/group'
import { trpc } from '../utils/trpc'

const StatusIcon = dynamic(() => import('./status-icon'), {
  ssr: false,
})

const SubscriptionButton = dynamic(() => import('./subscription-button'), {
  ssr: false,
})

const CreateGroupButton = dynamic(() => import('./create-group-button'), {
  ssr: false,
})

export default function CommunityNav(props: { className?: string }) {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
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

  return (
    <aside className={props.className}>
      <div className="flex w-full flex-col items-center rounded-md border border-gray-200 pb-4">
        <StatusIcon
          permalink={community?.entry.community}
          className="absolute right-3 top-3"
        />
        <Avatar
          name={community?.authorship.author}
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
                <SubscriptionButton
                  entry={query.entry}
                  className="float-right"
                />
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
            <div className="mt-4 w-full">
              <h3
                className="px-3 text-sm font-medium text-gray-400"
                id="projects-headline"
              >
                Groups
                <CreateGroupButton
                  entry={query.entry}
                  className="float-right"
                />
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
        'group flex w-full items-center border-l-4 px-3 py-2 text-sm font-medium',
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
