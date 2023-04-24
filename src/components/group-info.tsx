import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import Head from 'next/head'
import { useAtomValue } from 'jotai'

import useRouterQuery from '../hooks/use-router-query'
import { extractStartEmoji } from '../utils/emoji'
import { trpc } from '../utils/trpc'
import { documentTitle } from '../utils/constants'
import { previewGroupAtom } from '../utils/atoms'

export default function GroupInfo(props: { className?: string }) {
  const query = useRouterQuery<['community_id', 'group_id']>()
  const { data: community } = trpc.community.getById.useQuery(
    { id: query.community_id },
    { enabled: !!query.community_id },
  )
  const previewGroup = useAtomValue(previewGroupAtom)
  const { data } = trpc.group.getById.useQuery(
    { community_id: query.community_id, id: query.group_id },
    { enabled: !!query.community_id && !!query.group_id },
  )
  const group = previewGroup || data
  const router = useRouter()
  const tabs = useMemo(
    () => [
      {
        name: 'Proposals',
        href: `/${query.community_id}/${query.group_id}`,
        current: router.pathname === '/[community_id]/[group_id]',
      },
      {
        name: 'About',
        href: `/${query.community_id}/${query.group_id}/about`,
        current: router.pathname === '/[community_id]/[group_id]/about',
      },
    ],
    [query.community_id, query.group_id, router.pathname],
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
      <nav className={clsx('-mb-px flex space-x-8 border-b', props.className)}>
        {tabs.map((tab) => (
          <Tab
            key={tab.name}
            href={previewGroup ? undefined : tab.href}
            current={tab.current}
          >
            {tab.name}
          </Tab>
        ))}
      </nav>
    </>
  )
}

function Tab(props: { href?: string; current: boolean; children: string }) {
  const className = useMemo(
    () =>
      clsx(
        props.current
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
        'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
      ),
    [props],
  )

  return props.href ? (
    <Link href={props.href} scroll={false} shallow className={className}>
      {props.children}
    </Link>
  ) : (
    <span className={className}>{props.children}</span>
  )
}
