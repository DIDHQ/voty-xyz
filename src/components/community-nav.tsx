import {
  ClockIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { TwitterIcon, DiscordIcon, GitHubIcon } from './icons'
import useRouterQuery from '../hooks/use-router-query'
import Avatar from './basic/avatar'
import { extractStartEmoji } from '../utils/emoji'
import { Workgroup } from '../utils/schemas/workgroup'
import { trpc } from '../utils/trpc'
import { documentTitle } from '../utils/constants'

const StatusIcon = dynamic(() => import('./status-icon'), {
  ssr: false,
})

const SubscriptionButton = dynamic(() => import('./subscription-button'), {
  ssr: false,
})

const CreateWorkgroupButton = dynamic(
  () => import('./create-workgroup-button'),
  { ssr: false },
)

export default function CommunityNav(props: { className?: string }) {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const navigation = useMemo(
    () => [
      {
        name: 'Timeline',
        href: `/${query.entry}`,
        icon: ClockIcon,
        current: router.pathname === '/[entry]',
      },
      {
        name: 'About',
        href: `/${query.entry}/about`,
        icon: InformationCircleIcon,
        current: router.pathname === '/[entry]/about',
      },
    ],
    [query.entry, router.pathname],
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
  const title = useMemo(
    () => compact([community?.name, documentTitle]).join(' - '),
    [community?.name],
  )

  return (
    <>
      <Head>
        <title>{title}</title>
        {community?.extension?.avatar ? (
          <link rel="icon" href={community?.extension?.avatar} />
        ) : null}
      </Head>
      <aside
        className={clsx(
          'relative border-gray-200 sm:border-b-0',
          externals.length ? 'border-b' : undefined,
          props.className,
        )}
      >
        <StatusIcon
          permalink={community?.entry.community}
          className="absolute right-4 top-4"
        />
        <div className="flex w-full flex-col items-center rounded border border-gray-200 pb-4">
          <div className="flex w-full items-center space-x-4 p-6 sm:flex-col sm:space-y-4 sm:space-x-0 sm:py-8">
            <Avatar
              name={community?.authorship.author}
              value={community?.extension?.avatar}
              size={20}
              className="shrink-0"
            />
            <div className="sm:space-y-2">
              <h3 className="w-full break-words text-xl font-bold text-gray-900 line-clamp-2 sm:text-center sm:text-2xl">
                {community?.name || '...'}
              </h3>
              {community?.extension?.slogan ? (
                <p className="w-full text-center text-sm text-gray-500 line-clamp-2">
                  {community.extension.slogan}
                </p>
              ) : null}
            </div>
          </div>
          <div className="w-full">
            <h3 className="mb-1 px-4 text-sm font-medium text-gray-400">
              Community
              <SubscriptionButton entry={query.entry} className="float-right" />
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
                      : 'text-gray-300 group-hover:text-gray-400',
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
              <CreateWorkgroupButton
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
                  current={query.workgroup === workgroup.id}
                />
              ))}
            </div>
          </div>
        </div>
        {externals.length ? (
          <div className="mt-4 mb-6 flex space-x-4">
            {externals.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-gray-400"
              >
                <item.icon className="h-7 w-7" />
              </a>
            ))}
          </div>
        ) : null}
      </aside>
    </>
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
      href={`/${props.entry}/${props.workgroup.id}`}
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
              : 'text-gray-300 group-hover:text-gray-400',
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
