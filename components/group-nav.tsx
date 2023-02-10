import { TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { useRetrieve, useEntryConfig } from '../hooks/use-api'
import useRouterQuery from '../hooks/use-router-query'
import { DataType } from '../src/constants'

export default function GroupNav(props: { className?: string }) {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: config } = useEntryConfig(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)
  const group = useMemo(
    () =>
      query.group ? community?.groups?.[parseInt(query.group)] : undefined,
    [community?.groups, query.group],
  )
  const router = useRouter()
  const tabs = useMemo(
    () =>
      compact([
        {
          name: 'Proposals',
          href: `/${query.entry}/${query.group || 0}`,
          current: router.pathname === '/[entry]/[group]',
        },
        {
          name: 'Settings',
          href: `/${query.entry}/${query.group || 0}/settings`,
          current: router.pathname === '/[entry]/[group]/settings',
        },
        group?.extension.about
          ? {
              name: 'About',
              href: `/${query.entry}/${query.group || 0}/about`,
              current: router.pathname === '/[entry]/[group]/about',
            }
          : undefined,
      ]),
    [group?.extension.about, query.entry, query.group, router.pathname],
  )

  return (
    <div className={clsx('w-full bg-white pl-6', props.className)}>
      <div className="flex h-10 items-center">
        {group ? (
          group.permission.adding_option ? (
            <TrophyIcon
              className="mr-3 h-6 w-6 shrink-0 text-gray-400"
              aria-hidden="true"
            />
          ) : (
            <UserGroupIcon
              className="mr-3 h-6 w-6 shrink-0 text-gray-400"
              aria-hidden="true"
            />
          )
        ) : null}
        <h3 className="h-10 text-2xl font-medium text-gray-900">
          {group?.name || '...'}
        </h3>
      </div>
      <div className="border-b">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                tab.current
                  ? 'border-indigo-500 text-indigo-600'
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
  )
}
