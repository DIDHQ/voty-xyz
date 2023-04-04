import {
  ClockIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ExoticComponent, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useAtomValue } from 'jotai'

import { TwitterIcon, DiscordIcon, GitHubIcon } from './icons'
import useRouterQuery from '../hooks/use-router-query'
import Avatar from './basic/avatar'
import { extractStartEmoji } from '../utils/emoji'
import { trpc } from '../utils/trpc'
import { documentTitle } from '../utils/constants'
import TextButton from './basic/text-button'
import { previewCommunityAtom } from '../utils/atoms'
import Button from './basic/button'

const StatusIcon = dynamic(() => import('./status-icon'), {
  ssr: false,
})

const SubscriptionButton = dynamic(() => import('./subscription-button'), {
  ssr: false,
})

const CreateGroupButton = dynamic(() => import('./create-group-button'), {
  ssr: false,
})

export default function CommunityInfo(props: { className?: string }) {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'group']>()
  const { data } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const community = previewCommunity || data
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
        icon: DocumentTextIcon,
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
                  href: `https://github.com/${community.extension.github}`,
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
      </Head>
      <aside className={clsx('relative', props.className)}>
        {previewCommunity ? null : (
          <StatusIcon
            permalink={data?.entry.community}
            className="absolute right-4 top-4"
          />
        )}
        <div className="flex w-full flex-col items-center rounded-md border border-gray-200 pb-4">
          <div className="flex w-full items-center space-x-4 p-6 pb-0 sm:flex-col sm:space-x-0 sm:space-y-4 sm:pt-8">
            <Avatar
              value={community?.extension.logo}
              size={24}
              className="shrink-0"
            />
            <div className="sm:space-y-2">
              <h3 className="line-clamp-2 w-full break-words text-xl font-bold text-gray-900 sm:text-center sm:text-2xl">
                {community?.name || '...'}
              </h3>
              <p className="line-clamp-2 w-full text-sm text-gray-500 sm:text-center">
                {community?.extension.slogan || '...'}
              </p>
            </div>
          </div>
          <div className="my-6 w-full px-6">
            <div className="w-full border-t" />
          </div>
          <div className="w-full">
            <h3 className="mb-2 px-4 text-sm font-medium text-gray-400">
              Community
              {previewCommunity ? null : (
                <SubscriptionButton
                  entry={query.entry}
                  className="float-right"
                />
              )}
            </h3>
            {navigation.map((item) => (
              <LinkListItem
                key={item.name}
                href={previewCommunity ? undefined : item.href}
                icon={item.icon}
                current={item.current}
              >
                {item.name}
              </LinkListItem>
            ))}
          </div>
          <div className="mt-6 w-full">
            <h3 className="mb-2 px-4 text-sm font-medium text-gray-400">
              Workgroups
              {previewCommunity ? null : (
                <CreateGroupButton
                  entry={query.entry}
                  className="float-right"
                />
              )}
            </h3>
            <div>
              {community?.groups?.map((group) => (
                <LinkListItem
                  key={group.id}
                  href={
                    previewCommunity ? undefined : `/${query.entry}/${group.id}`
                  }
                  icon={BriefcaseIcon}
                  current={query.group === group.id}
                >
                  {group.name}
                </LinkListItem>
              ))}
            </div>
          </div>
          {externals.length ? (
            <>
              <div className="my-6 w-full px-6">
                <div className="w-full border-t" />
              </div>
              <div className="flex space-x-4">
                {externals.map((item) => (
                  <TextButton key={item.href} href={item.href}>
                    <item.icon className="h-7 w-7" />
                  </TextButton>
                ))}
              </div>
            </>
          ) : null}
          {community?.extension.how_to_join ? (
            previewCommunity ? (
              <Button primary className="mt-4">
                Want to join?
              </Button>
            ) : (
              <Link href={`/${query.entry}/about#how-to-join`} className="mt-4">
                <Button primary>Want to join?</Button>
              </Link>
            )
          ) : null}
        </div>
      </aside>
    </>
  )
}

function LinkListItem(props: {
  href?: string
  current?: boolean
  icon?: ExoticComponent<{ className?: string }>
  children: string
}) {
  const emoji = useMemo(
    () => extractStartEmoji(props.children),
    [props.children],
  )
  const content = useMemo(
    () => (
      <>
        {emoji ? (
          <span
            className="mr-2 w-5 shrink-0 text-center text-lg"
            aria-hidden="true"
          >
            {emoji}
          </span>
        ) : props.icon ? (
          <props.icon
            className={clsx(
              props.current
                ? 'text-primary-500'
                : 'text-gray-300 group-hover:text-gray-400',
              'mr-2 h-5 w-5 shrink-0',
            )}
            aria-hidden="true"
          />
        ) : null}
        <span className="truncate">
          {props.children.replace(emoji || '', '')}
        </span>
      </>
    ),
    [emoji, props],
  )
  const className = useMemo(
    () =>
      clsx(
        props.current
          ? 'text-primary-600'
          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        'group flex h-10 items-center px-6 py-2 text-sm font-medium',
      ),
    [props],
  )

  return props.href ? (
    <Link href={props.href} scroll={false} shallow className={className}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  )
}
