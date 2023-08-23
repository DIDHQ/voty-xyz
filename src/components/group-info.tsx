import { compact } from 'remeda'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { clsx } from 'clsx'
import { clsxMerge } from '../utils/tailwind-helper'

import useRouterQuery from '../hooks/use-router-query'
import { extractStartEmoji } from '../utils/emoji'
import { trpc } from '../utils/trpc'
import { documentTitle } from '../utils/constants'
import { previewGroupAtom } from '../utils/atoms'
import SectionHeader from './basic/section-header'

export default function GroupInfo(props: { className?: string }) {
  const query = useRouterQuery<['communityId', 'groupId']>()
  const { data: community } = trpc.community.getById.useQuery(
    { id: query.communityId },
    { enabled: !!query.communityId },
  )
  const previewGroup = useAtomValue(previewGroupAtom)
  const { data } = trpc.group.getById.useQuery(
    { communityId: query.communityId, id: query.groupId },
    { enabled: !!query.communityId && !!query.groupId },
  )
  const group = previewGroup || data
  const router = useRouter()
  const tabs = useMemo(
    () => [
      {
        name: 'Proposals',
        href: `/${query.communityId}/group/${query.groupId}`,
        current: router.pathname === '/[communityId]/group/[groupId]',
      },
      {
        name: 'About',
        href: `/${query.communityId}/group/${query.groupId}/about`,
        current: router.pathname === '/[communityId]/group/[groupId]/about',
      },
    ],
    [query.communityId, query.groupId, router.pathname],
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
      
      <SectionHeader 
        title={name || '...'} />
      
      <nav 
        className={clsxMerge(
          'mb-5 flex space-x-5 border-b border-base', 
          props.className
        )}>
        {tabs.map((tab) => (
          <Tab
            key={tab.name}
            href={previewGroup ? undefined : tab.href}
            current={tab.current}>
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
          ? 'text-primary-500 after:bg-primary-500'
          : 'border-transparent text-moderate hover:text-strong',
        'relative whitespace-nowrap px-1 pb-2 text-sm-medium after:absolute after:bottom-[-2px] after:left-0 after:h-0.5 after:w-full',
      ),
    [props],
  )

  return props.href ? (
    <Link 
      href={props.href} 
      scroll={false} 
      shallow 
      className={className}>
      {props.children}
    </Link>
  ) : (
    <span 
      className={className}>
      {props.children}
    </span>
  )
}
