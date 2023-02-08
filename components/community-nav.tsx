import {
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  PlusIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { useRetrieve, useEntryConfig } from '../hooks/use-api'
import useRouterQuery from '../hooks/use-router-query'
import { DataType } from '../src/constants'
import Avatar from './basic/avatar'
import { TwitterIcon, DiscordIcon, GitHubIcon } from './icons'

export default function CommunityNav(props: { className?: string }) {
  const router = useRouter()
  const [query] = useRouterQuery<['entry', 'group']>()
  const entry = query.entry
  const { data: config } = useEntryConfig(entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)
  const navigation = useMemo(
    () =>
      compact([
        {
          name: 'Timeline',
          href: `/${entry}`,
          icon: ClockIcon,
          current: router.pathname === '/[entry]',
        },
        {
          name: 'Settings',
          href: `/${entry}/settings`,
          icon: CogIcon,
          current: router.pathname === '/[entry]/settings',
        },
        community?.extension?.about
          ? {
              name: 'About',
              href: `/${entry}/about`,
              icon: DocumentTextIcon,
              current: router.pathname === '/[entry]/about',
            }
          : undefined,
      ]),
    [community?.extension?.about, entry, router.pathname],
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
      <div className="flex w-60 flex-col items-center rounded-md border border-gray-300 pb-4 shadow-sm">
        <Avatar
          name={community?.author.did}
          value={community?.extension?.avatar}
          size={20}
          className="mt-8"
        />
        <h3 className="my-4 text-xl font-bold text-gray-900 sm:text-2xl">
          {community?.name || '...'}
        </h3>
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
        <div className="mt-4 w-full">
          <h3
            className="px-3 text-sm font-medium text-gray-400"
            id="projects-headline"
          >
            Groups
            <Link
              href={`/${entry}/${community?.groups?.length || 0}/settings`}
              className="float-right"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </Link>
          </h3>
          <div className="mt-1 space-y-1" aria-labelledby="projects-headline">
            {community?.groups?.map((group, index) => (
              <Link
                key={group.name}
                href={`/${entry}/${index}`}
                className={clsx(
                  query.group === index.toString()
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center border-l-4 px-3 py-2 text-sm font-medium',
                )}
              >
                {group.permission.adding_option ? (
                  <TrophyIcon
                    className={clsx(
                      query.group === index.toString()
                        ? 'text-indigo-500'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 h-6 w-6 shrink-0',
                    )}
                    aria-hidden="true"
                  />
                ) : (
                  <UserGroupIcon
                    className={clsx(
                      query.group === index.toString()
                        ? 'text-indigo-500'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 h-6 w-6 shrink-0',
                    )}
                    aria-hidden="true"
                  />
                )}
                <span className="truncate">{group.name}</span>
              </Link>
            ))}
          </div>
        </div>
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
