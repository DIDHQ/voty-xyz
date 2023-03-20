import { BriefcaseIcon, TrophyIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import Head from 'next/head'

import useGroup from '../hooks/use-group'
import useRouterQuery from '../hooks/use-router-query'
import { extractStartEmoji } from '../utils/emoji'
import { trpc } from '../utils/trpc'
import { documentTitle } from '../utils/constants'

export default function GroupInfo(props: { className?: string }) {
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group)
  const router = useRouter()
  const tabs = useMemo(
    () => [
      {
        name: group?.extension.type
          ? group.extension.type === 'grant'
            ? 'Rounds'
            : 'Proposals'
          : '',
        href: `/${query.entry}/${query.group}`,
        current: router.pathname === '/[entry]/[group]',
      },
      {
        name: 'Rules',
        href: `/${query.entry}/${query.group}/rules`,
        current: router.pathname === '/[entry]/[group]/rules',
      },
    ],
    [group?.extension.type, query.entry, query.group, router.pathname],
  )
  const emoji = useMemo(() => extractStartEmoji(group?.name), [group?.name])
  const name = useMemo(
    () => group?.name.replace(emoji || '', ''),
    [emoji, group?.name],
  )
  const title = useMemo(
    () => compact([name, community?.name, documentTitle]).join(' - '),
    [community?.name, name],
  )

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={clsx('bg-white/80 backdrop-blur', props.className)}>
        <div className="flex h-10 items-center">
          {emoji ? (
            <span
              className="mr-3 w-8 shrink-0 text-center text-3xl text-gray-400"
              aria-hidden="true"
            >
              {emoji}
            </span>
          ) : group ? (
            group.extension.type === 'grant' ? (
              <TrophyIcon
                className="mr-3 h-8 w-8 shrink-0 text-gray-400"
                aria-hidden="true"
              />
            ) : (
              <BriefcaseIcon
                className="mr-3 h-8 w-8 shrink-0 text-gray-400"
                aria-hidden="true"
              />
            )
          ) : null}
          <h3 className="mr-4 w-0 flex-1 truncate text-2xl font-medium text-gray-900">
            {name || '...'}
          </h3>
        </div>
        {group?.extension.introduction ? (
          <p className="mt-2 text-sm text-gray-500 line-clamp-1">
            {group.extension.introduction}
          </p>
        ) : null}
        <div className="mt-2 border-b">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                scroll={false}
                className={clsx(
                  tab.current
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                  'h-14 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                )}
                aria-current={tab.current ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
