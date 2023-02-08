import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { useRetrieve } from '../hooks/use-api'
import useDidConfig from '../hooks/use-did-config'
import useRouterQuery from '../hooks/use-router-query'
import { DataType } from '../src/constants'

export default function GroupNav(props: { className?: string }) {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: config } = useDidConfig(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)
  const group = useMemo(
    () =>
      query.group ? community?.groups?.[parseInt(query.group)] : undefined,
    [community?.groups, query.group],
  )
  const router = useRouter()
  const tabs = useMemo(
    () => [
      {
        name: 'Proposals',
        href: `/${query.entry}/${query.group || 0}`,
        current: router.pathname === '/[entry]/[group]',
      },
      {
        name: 'Rules',
        href: `/${query.entry}/${query.group || 0}/settings`,
        current: router.pathname === '/[entry]/[group]/settings',
      },
    ],
    [query, router.pathname],
  )

  return (
    <div className={clsx('w-full bg-white', props.className)}>
      <div>
        <h3 className="text-2xl font-medium text-gray-900">{group?.name}</h3>
        {group ? (
          <div className="mt-1">
            <p className="text-sm text-gray-600">{group?.extension?.about}</p>
          </div>
        ) : null}
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                tab.current
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
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
