import { HomeIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useMemo } from 'react'

import useRouterQuery from '../hooks/use-router-query'

export default function Breadcrumbs() {
  const [query] = useRouterQuery<['entry', 'group', 'proposal']>()
  const pages = useMemo<
    { name: string; href: string; current?: boolean }[]
  >(() => {
    if (query.entry && query.group && query.proposal) {
      return [
        { name: 'Community', href: `/${query.entry}` },
        { name: 'Group', href: `/${query.entry}/${query.group}` },
        {
          name: 'Proposal',
          href: `/${query.entry}/${query.group}/${query.proposal}`,
          current: true,
        },
      ]
    }
    if (query.entry && query.group) {
      return [
        { name: 'Community', href: `/${query.entry}` },
        {
          name: 'Group',
          href: `/${query.entry}/${query.group}`,
          current: true,
        },
      ]
    }
    if (query.entry) {
      return [{ name: 'Community', href: `/${query.entry}`, current: true }]
    }
    return []
  }, [query])

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link href="/" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 shrink-0 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <Link
                href={page.href}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={page.current ? 'page' : undefined}
              >
                {page.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
