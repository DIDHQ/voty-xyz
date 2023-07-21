import {
  GlobeAltIcon,
  BriefcaseIcon,
  TrophyIcon,
  QuestionMarkCircleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import { compact, uniqBy } from 'remeda'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ExoticComponent, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { useQuery } from '@tanstack/react-query'

import useRouterQuery from '../hooks/use-router-query'
import { extractStartEmoji } from '../utils/emoji'
import { trpc } from '../utils/trpc'
import { documentTitle, domain } from '../utils/constants'
import { previewCommunityAtom, previewGroupAtom } from '../utils/atoms'
import useIsManager from '../hooks/use-is-manager'
import { hasEnabledSubDID } from '../utils/sdks/dotbit/subdid'
import ShareLinkIcon from './share-link-icon'
import TextLink from './basic/text-link'
import Avatar from './basic/avatar'
import { TwitterIcon, DiscordIcon, GitHubIcon } from './icons'

const SubscriptionButton = dynamic(() => import('./subscription-button'), {
  ssr: false,
})

export default function CommunityInfo(props: { className?: string }) {
  const router = useRouter()
  const query = useRouterQuery<['community_id', 'group_id']>()
  const { data } = trpc.community.getById.useQuery(
    { id: query.community_id },
    { enabled: !!query.community_id },
  )
  const { data: list } = trpc.group.listByCommunityId.useQuery(
    { communityId: query.community_id },
    { enabled: !!query.community_id },
  )
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const previewGroup = useAtomValue(previewGroupAtom)
  const community = previewCommunity || data
  const groups = useMemo(
    () => uniqBy(compact([...(list || []), previewGroup]), ({ id }) => id),
    [list, previewGroup],
  )
  const navigation = useMemo(
    () => [
      {
        name: 'Activities',
        href: `/${query.community_id}`,
        icon: BoltIcon,
        current: router.pathname === '/[community_id]',
      },
      {
        name: 'Topic Grants',
        href: `/${query.community_id}/grant`,
        icon: TrophyIcon,
        current: router.pathname === '/[community_id]/grant',
      },
      {
        name: 'About',
        href: `/${query.community_id}/about`,
        icon: QuestionMarkCircleIcon,
        current: router.pathname === '/[community_id]/about',
      },
    ],
    [query.community_id, router.pathname],
  )
  const externals = useMemo(
    () =>
      community?.links
        ? compact([
            community.links.website
              ? { href: community.links.website, icon: GlobeAltIcon }
              : undefined,
            community.links.twitter
              ? {
                  href: `https://twitter.com/${community.links.twitter}`,
                  icon: TwitterIcon,
                }
              : undefined,
            community.links.discord
              ? {
                  href: `https://discord.com/invite/${community.links.discord}`,
                  icon: DiscordIcon,
                }
              : undefined,
            community.links.github
              ? {
                  href: `https://github.com/${community.links.github}`,
                  icon: GitHubIcon,
                }
              : undefined,
          ])
        : [],
    [community],
  )
  const isManager = useIsManager(query.community_id)
  const title = useMemo(
    () => compact([community?.name, documentTitle]).join(' - '),
    [community?.name],
  )
  // const { account } = useWallet()
  // const { data: dids } = useDids(account)
  // const isMember = useMemo(
  //   () =>
  //     !!dids?.find(
  //       (did) => !!query.community_id && did.endsWith(query.community_id),
  //     ),
  //   [dids, query.community_id],
  // )
  const { data: enabledSubDID } = useQuery(
    ['hasEnabledSubDID', query.community_id],
    () => hasEnabledSubDID(query.community_id!),
    { enabled: !!query.community_id && isManager },
  )

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <aside className={clsx('relative', props.className)}>
        {previewCommunity ? null : (
          <ShareLinkIcon
            link={`${domain}/${query.community_id}`}
            className="absolute right-4 top-4"
          />
        )}
        <div className="flex w-full flex-col items-center rounded-md border border-gray-200 pb-4">
          <div className="flex w-full items-center space-x-4 p-6 pb-0 sm:flex-col sm:space-x-0 sm:space-y-4 sm:pt-8">
            <Avatar value={community?.logo} size={24} className="shrink-0" />
            <div className="sm:space-y-2">
              <h3 className="line-clamp-3 w-full break-words text-xl font-bold text-gray-900 sm:text-center sm:text-2xl">
                {community?.name || '...'}
              </h3>
              <p className="line-clamp-3 w-full text-sm text-gray-500 sm:text-center">
                {community?.slogan || '...'}
              </p>
            </div>
          </div>
          {/* {isMember || previewCommunity ? (
            <Button disabled={isMember} className="mt-4">
              {isMember ? 'Joined' : 'Join'}
            </Button>
          ) : (
            <Link
              href={`${
                isTestnet
                  ? '​https://test.topdid.com/mint/.'
                  : 'https://topdid.com/mint/.'
              }${query.community_id?.replace(/\.bit$/, '')}`}
              className="mt-4"
            >
              <Button primary disabled={isMember}>
                {isMember ? 'Joined' : 'Join'}
              </Button>
            </Link>
          )} */}
          <div className="my-6 w-full px-6">
            <div className="w-full border-t" />
          </div>
          <div className="w-full">
            <h3 className="mb-2 px-4 text-sm font-medium text-gray-400">
              Community
              {previewCommunity ? null : (
                <SubscriptionButton
                  communityId={query.community_id}
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
          {isManager || groups?.length ? (
            <div className="mt-6 w-full">
              <h3 className="mb-2 px-4 text-sm font-medium text-gray-400">
                Workgroups
                {previewCommunity ||
                !isManager ||
                enabledSubDID === false ? null : (
                  <TextLink
                    primary
                    href={`/${query.community_id}/create`}
                    className="float-right"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </TextLink>
                )}
              </h3>
              <div>
                {groups?.map((group) => (
                  <LinkListItem
                    key={group.id}
                    href={
                      previewCommunity
                        ? undefined
                        : `/${query.community_id}/group/${group.id}`
                    }
                    icon={BriefcaseIcon}
                    current={query.group_id === group.id}
                  >
                    {group.name}
                  </LinkListItem>
                ))}
              </div>
            </div>
          ) : null}
          {externals.length ? (
            <>
              <div className="my-6 w-full px-6">
                <div className="w-full border-t" />
              </div>
              <div className="flex space-x-4">
                {externals.map((item) => (
                  <TextLink key={item.href} href={item.href}>
                    <item.icon className="h-7 w-7" />
                  </TextLink>
                ))}
              </div>
            </>
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
          <span className="mr-2 w-5 shrink-0 text-center text-lg">{emoji}</span>
        ) : props.icon ? (
          <props.icon
            className={clsx(
              props.current
                ? 'text-primary-500'
                : 'text-gray-300 group-hover:text-gray-400',
              'mr-2 h-5 w-5 shrink-0',
            )}
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
