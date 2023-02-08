import { HomeIcon } from '@heroicons/react/20/solid'
import { compact, last, lowerCase, upperFirst } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import useRouterQuery from '../hooks/use-router-query'

function getPageFromPathname(pathname: string) {
  const name = last(pathname.split('/'))
  if (!name) {
    return
  }
  if (name.startsWith('[') && name.endsWith(']')) {
    return
  }
  return { name: upperFirst(lowerCase(name)) }
}

export default function Breadcrumbs() {
  const router = useRouter()
  const [query] = useRouterQuery<['entry', 'group', 'proposal']>()
  const pages = useMemo<{ name: string; href?: string }[]>(() => {
    const page = getPageFromPathname(router.pathname)
    if (query.entry && query.group && query.proposal) {
      return compact([
        { name: 'Community', href: `/${query.entry}` },
        { name: 'Group', href: `/${query.entry}/${query.group}` },
        {
          name: 'Proposal',
          href: page
            ? `/${query.entry}/${query.group}/${query.proposal}`
            : undefined,
        },
        page,
      ])
    }
    if (query.entry && query.group) {
      return compact([
        { name: 'Community', href: `/${query.entry}` },
        {
          name: 'Group',
          href: page ? `/${query.entry}/${query.group}` : undefined,
        },
        page,
      ])
    }
    if (query.entry) {
      return compact([
        { name: 'Community', href: page ? `/${query.entry}` : undefined },
        page,
      ])
    }
    return compact([page])
  }, [query.entry, query.group, query.proposal, router.pathname])

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
              {page.href ? (
                <Link
                  href={page.href}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  aria-current="page"
                >
                  {page.name}
                </Link>
              ) : (
                <span className="ml-4 text-sm font-medium text-gray-700">
                  {page.name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
