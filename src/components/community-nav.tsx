import {
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  BriefcaseIcon,
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
import { Workgroup } from '../utils/schemas/workgroup'
import { trpc } from '../utils/trpc'

const StatusIcon = dynamic(() => import('./status-icon'), {
  ssr: false,
})

const SubscriptionButton = dynamic(() => import('./subscription-button'), {
  ssr: false,
})

const CreateGroupButton = dynamic(() => import('./create-workgroup-button'), {
  ssr: false,
})

export default function CommunityNav(props: { className?: string }) {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
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
      <div className="flex w-full flex-col items-center border border-gray-200 pb-4">
        <StatusIcon
          permalink={community?.entry.community}
          className="absolute right-4 top-4"
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
            <div className="mt-4 w-full">
              <h3 className="mb-1 px-4 text-sm font-medium text-gray-400">
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
                  scroll={false}
                  className={clsx(
                    item.current
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex h-10 items-center border-l-4 px-4 py-2 text-sm font-medium',
                  )}
                >
                  <item.icon
                    className={clsx(
                      item.current
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-2 h-6 w-6 shrink-0',
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="mt-4 w-full">
              <h3 className="mb-1 px-4 text-sm font-medium text-gray-400">
                Workgroups
                <CreateGroupButton
                  entry={query.entry}
                  className="float-right"
                />
              </h3>
              <div>
                {community?.workgroups?.map((workgroup, index) => (
                  <WorkgroupListItem
                    key={workgroup.name + index}
                    entry={query.entry}
                    workgroup={workgroup}
                    current={query.workgroup === workgroup.extension.id}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
      {externals.length ? (
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
      ) : null}
    </aside>
  )
}

function WorkgroupListItem(props: {
  entry?: string
  workgroup: Workgroup
  current: boolean
}) {
  const emoji = useMemo(
    () => extractStartEmoji(props.workgroup.name),
    [props.workgroup.name],
  )

  return (
    <Link
      href={`/${props.entry}/${props.workgroup.extension.id}`}
      scroll={false}
      className={clsx(
        props.current
          ? 'border-primary-600 bg-primary-50 text-primary-600'
          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        'group flex h-10 w-full items-center border-l-4 px-4 py-2 text-sm font-medium',
      )}
    >
      {emoji ? (
        <span
          className="mr-2 w-6 shrink-0 text-center text-xl"
          aria-hidden="true"
        >
          {emoji}
        </span>
      ) : (
        <BriefcaseIcon
          className={clsx(
            props.current
              ? 'text-primary-500'
              : 'text-gray-400 group-hover:text-gray-500',
            'mr-2 h-6 w-6 shrink-0',
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate">
        {props.workgroup.name.replace(emoji || '', '')}
      </span>
    </Link>
  )
}
