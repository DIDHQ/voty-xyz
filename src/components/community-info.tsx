import {
  GlobeAltIcon,
  BriefcaseIcon,
  TrophyIcon,
  QuestionMarkCircleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/20/solid'
import { compact, uniqBy } from 'remeda'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ExoticComponent, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { tv } from 'tailwind-variants'
import { clsx } from 'clsx'
import { clsxMerge } from '../utils/tailwind-helper'

import useRouterQuery from '../hooks/use-router-query'
import { extractStartEmoji } from '../utils/emoji'
import { trpc } from '../utils/trpc'
import { documentTitle, domain } from '../utils/constants'
import { previewCommunityAtom, previewGroupAtom } from '../utils/atoms'
import useIsManager from '../hooks/use-is-manager'
import useCommunityLogo from '../hooks/use-community-logo'
import { formatDid } from '../utils/did/utils'
import { useEnabledSecondLevel } from '../hooks/use-second-level-dids'
import ShareLinkIcon from './share-link-icon'
import TextLink from './basic/text-link'
import Avatar from './basic/avatar'
import {
  TwitterOutlineIcon,
  DiscordOutlineIcon,
  GitHubOutlineIcon,
} from './icons'
import Card from './basic/card'
import { CommunityInfoSkeleton } from './basic/skeleton'

const SubscriptionButton = dynamic(() => import('./subscription-button'), {
  ssr: false,
})

const navClass = tv({
  slots: {
    navHeader: 'mb-2 flex h-5 items-center justify-between',
    navTitle: 'text-xs uppercase text-subtle',
  },
})

const { navHeader: navHeaderClass, navTitle: navTitleClass } = navClass()

export default function CommunityInfo(props: {
  loading?: boolean
  className?: string
}) {
  const { loading = false, className } = props

  const router = useRouter()
  const query = useRouterQuery<['communityId', 'groupId']>()
  const { data } = trpc.community.getById.useQuery(
    { id: query.communityId },
    { enabled: !!query.communityId },
  )
  const { data: list } = trpc.group.listByCommunityId.useQuery(
    { communityId: query.communityId },
    { enabled: !!query.communityId },
  )
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const previewGroup = useAtomValue(previewGroupAtom)
  const community = previewCommunity || data
  const { data: logo } = useCommunityLogo(data?.permalink)
  const groups = useMemo(
    () => uniqBy(compact([...(list || []), previewGroup]), ({ id }) => id),
    [list, previewGroup],
  )
  const isManager = useIsManager(query.communityId)
  const { data: enabledSecondLevel } = useEnabledSecondLevel(query.communityId)
  const navigation = useMemo(
    () =>
      query.communityId
        ? [
            {
              name: 'Activities',
              href: `/${formatDid(query.communityId, enabledSecondLevel)}`,
              icon: BoltIcon,
              current: router.pathname === '/[communityId]',
            },
            {
              name: 'Topic Grants',
              href: `/${formatDid(
                query.communityId,
                enabledSecondLevel,
              )}/grant`,
              icon: TrophyIcon,
              current: router.pathname === '/[communityId]/grant',
            },
            {
              name: 'About',
              href: `/${formatDid(
                query.communityId,
                enabledSecondLevel,
              )}/about`,
              icon: QuestionMarkCircleIcon,
              current: router.pathname === '/[communityId]/about',
            },
          ]
        : [],
    [enabledSecondLevel, query.communityId, router.pathname],
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
                  icon: TwitterOutlineIcon,
                }
              : undefined,
            community.links.discord
              ? {
                  href: `https://discord.com/invite/${community.links.discord}`,
                  icon: DiscordOutlineIcon,
                }
              : undefined,
            community.links.github
              ? {
                  href: `https://github.com/${community.links.github}`,
                  icon: GitHubOutlineIcon,
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
  // const { account } = useWallet()
  // const { data: dids } = useDids(account)
  // const isMember = useMemo(
  //   () =>
  //     !!dids?.find(
  //       (did) => !!query.communityId && did.endsWith(query.communityId),
  //     ),
  //   [dids, query.communityId],
  // )

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className={className}>
        <Card className="relative z-0 !pt-[60px]">
          <div className="absolute left-0 top-0 z-[-1] h-24 w-full bg-base bg-[url(/images/community-cover.jpg)] bg-cover bg-top bg-no-repeat"></div>

          {/* Photo by <a href="https://unsplash.com/@scottwebb?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Scott Webb</a> on <a href="https://unsplash.com/photos/mV9-1XjnM4Y?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a> */}

          {previewCommunity ? null : (
            <ShareLinkIcon
              link={`${domain}/${query.communityId}`}
              className="absolute right-5 top-5"
            />
          )}

          <Avatar
            className="shrink-0 ring-4 ring-white"
            value={logo}
            size={16}
          />

          {!loading ? (
            <div className="mt-3">
              <h3 className="text-lg-semibold text-strong">
                {community?.name || '...'}
              </h3>

              <p className="mt-1 text-sm-regular text-moderate">
                {community?.slogan || '...'}
              </p>
            </div>
          ) : (
            <CommunityInfoSkeleton />
          )}

          {externals.length ? (
            <>
              <div className="mt-4 flex space-x-3">
                {externals.map((item) => (
                  <TextLink key={item.href} href={item.href}>
                    <item.icon className="h-[18px] w-[18px] text-moderate transition hover:text-strong" />
                  </TextLink>
                ))}
              </div>
            </>
          ) : null}
        </Card>

        <Card>
          <div>
            <div className={navHeaderClass()}>
              <h3 className={navTitleClass()}>Community</h3>

              {previewCommunity ? null : (
                <SubscriptionButton communityId={query.communityId} />
              )}
            </div>

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
            <div className="mt-5">
              <div className={navHeaderClass()}>
                <h3 className={navTitleClass()}>Workgroups</h3>

                {previewCommunity ||
                !isManager ||
                enabledSecondLevel === false ||
                !query.communityId ? null : (
                  <TextLink
                    primary
                    href={`/${formatDid(
                      query.communityId,
                      enabledSecondLevel,
                    )}/create`}
                  >
                    <PlusIcon className="h-5 w-5" />
                  </TextLink>
                )}
              </div>

              <div>
                {groups?.map((group) => (
                  <LinkListItem
                    key={group.id}
                    href={
                      previewCommunity || !query.communityId
                        ? undefined
                        : `/${formatDid(
                            query.communityId,
                            enabledSecondLevel,
                          )}/group/${group.id}`
                    }
                    icon={BriefcaseIcon}
                    current={query.groupId === group.id}
                  >
                    {group.name}
                  </LinkListItem>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

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
            }${query.communityId?.replace(/\.bit$/, '')}`}
            className="mt-4"
          >
            <Button primary disabled={isMember}>
              {isMember ? 'Joined' : 'Join'}
            </Button>
          </Link>
        )} */}
      </div>
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
          <span className="shrink-0 text-lg leading-none">{emoji}</span>
        ) : props.icon ? (
          <props.icon
            className={clsxMerge(
              props.current ? 'text-primary-500' : 'text-moderate',
              'h-[18px] w-[18px] shrink-0',
            )}
          />
        ) : null}

        <span
          className={clsxMerge(
            'truncate',
            props.current ? 'text-primary-500' : 'text-moderate',
          )}
        >
          {props.children.replace(emoji || '', '')}
        </span>
      </>
    ),
    [emoji, props],
  )

  const className = useMemo(
    () =>
      clsx(
        props.current ? 'bg-primary-500/5' : 'hover:bg-subtle',
        'group mb-1 flex h-10 items-center gap-2 rounded-xl px-3 text-sm-medium',
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
