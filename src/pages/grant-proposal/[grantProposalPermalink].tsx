import { useCallback, useEffect, useMemo } from 'react'
import { compact } from 'remeda'
import { useInView } from 'react-intersection-observer'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import Confetti from 'react-confetti'
import { useWindowSize } from 'usehooks-ts'
import pMap from 'p-map'
import { useQuery } from '@tanstack/react-query'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { GetServerSideProps } from 'next'
import { SuperJSON } from 'superjson'

import { tv } from 'tailwind-variants'
import {
  id2Permalink,
  isPermalink,
  permalink2Explorer,
  permalink2Gateway,
  permalink2Id,
} from '@/src/utils/permalink'
import { trpc } from '@/src/utils/trpc'
import Article from '@/src/components/basic/article'
import TextLink from '@/src/components/basic/text-link'
import LoadingBar from '@/src/components/basic/loading-bar'
import {
  documentDescription,
  documentImage,
  documentTitle,
  previewPermalink,
  twitterHandle,
} from '@/src/utils/constants'
import useRouterQuery from '@/src/hooks/use-router-query'
import MarkdownViewer from '@/src/components/basic/markdown-viewer'
import GrantProposalInfo from '@/src/components/grant-proposal-info'
import { previewGrantProposalAtom } from '@/src/utils/atoms'
import { GrantProposal } from '@/src/utils/schemas/v1/grant-proposal'
import GrantProposalVoteForm from '@/src/components/grant-proposal-vote-form'
import { GrantPhase, getGrantPhase } from '@/src/utils/phase'
import useStatus from '@/src/hooks/use-status'
import useNow from '@/src/hooks/use-now'
import { formatDid } from '@/src/utils/did/utils'
import { CrownIcon } from '@/src/components/icons'
import useWallet from '@/src/hooks/use-wallet'
import useDids from '@/src/hooks/use-dids'
import GrantProposalSelectForm from '@/src/components/grant-proposal-select-form'
import { checkBoolean } from '@/src/utils/functions/boolean'
import { parseImage, parseRoot, parseContent } from '@/src/utils/markdown'
import { appRouter } from '@/src/server/routers/_app'
import { Container, Main, Sidebar } from '@/src/components/basic/container'
import Card from '@/src/components/basic/card'
import { Back } from '@/src/components/basic/back'
import Button from '@/src/components/basic/button'
import { Table, TableCell, TableRow } from '@/src/components/basic/table'
import Tag from '@/src/components/basic/tag'
import {
  ArticleSkeleton,
  SidebarInfoSkeleton,
} from '@/src/components/basic/skeleton'

const pagingButtonClass = tv({
  base: 'border-white bg-white text-moderate enabled:hover:bg-white enabled:hover:text-strong disabled:text-subtle disabled:opacity-60',
})

export const runtime = 'experimental-edge'

export const getServerSideProps: GetServerSideProps<
  Record<string, unknown>
> = async (context) => {
  const id = context.query.grantProposalPermalink as string
  if (id === previewPermalink) {
    return { props: {} }
  }
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: SuperJSON,
  })
  if (id) {
    await helpers.grantProposal.getByPermalink.prefetch({
      permalink: id2Permalink(id),
    })
  }
  context.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  return { props: {} }
}

export default function GrantProposalPage() {
  const query = useRouterQuery<['grantProposalPermalink']>()
  const previewGrantProposal = useAtomValue(previewGrantProposalAtom)
  const {
    data,
    isLoading: fetching,
    refetch,
  } = trpc.grantProposal.getByPermalink.useQuery(
    { permalink: query.grantProposalPermalink },
    { enabled: !!query.grantProposalPermalink },
  )
  const isFetching = !!query.grantProposalPermalink ? fetching : false
  const grantProposal = useMemo<
    | (GrantProposal & {
        ts: Date
        selected: string | null
        votes: number
        permalink: string
        authorship?: { author?: string }
      })
    | undefined
  >(() => {
    if (previewGrantProposal) {
      return {
        ...previewGrantProposal,
        ts: new Date(),
        selected: null,
        votes: 0,
        permalink: previewPermalink,
        authorship: { author: previewGrantProposal.preview.author },
      }
    }
    return query.grantProposalPermalink && data
      ? { ...data, permalink: query.grantProposalPermalink }
      : undefined
  }, [data, previewGrantProposal, query.grantProposalPermalink])
  const { data: grant, isLoading: grantLoading } =
    trpc.grant.getByPermalink.useQuery(
      { permalink: grantProposal?.grant },
      { enabled: !!grantProposal?.grant, refetchOnWindowFocus: false },
    )
  const isGrantLoading = !!grantProposal?.grant ? grantLoading : false
  const { data: community, isLoading: communityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: grant?.community },
      { enabled: !!grant?.community, refetchOnWindowFocus: false },
    )
  const isCommunityLoading = !!grant?.community ? communityLoading : false
  const {
    data: list,
    fetchNextPage,
    hasNextPage,
    refetch: refetchList,
  } = trpc.grantProposalVote.list.useInfiniteQuery(
    { grantProposal: query.grantProposalPermalink },
    {
      enabled: !!query.grantProposalPermalink,
      getNextPageParam: ({ next }) => next,
    },
  )
  const grantProposalVotes = useMemo(
    () => list?.pages.flatMap(({ data }) => data),
    [list],
  )
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])
  const title = useMemo(
    () =>
      compact([
        grantProposal?.title,
        grant?.name,
        community?.name,
        documentTitle,
      ]).join(' - '),
    [community?.name, grantProposal?.title, grant?.name],
  )
  const root = useMemo(
    () => parseRoot(grantProposal?.content),
    [grantProposal?.content],
  )
  const description = useMemo(
    () => parseContent(root) ?? documentDescription,
    [root],
  )
  const image = useMemo(() => {
    const image = parseImage(root)
    if (!image) {
      return documentImage
    }
    return isPermalink(image) ? permalink2Gateway(image) : image
  }, [root])
  const { account } = useWallet()
  const { data: grantProposals, refetch: refetchProposals } =
    trpc.grantProposal.list.useQuery(
      { grantPermalink: grantProposal?.grant, viewer: account?.address },
      { enabled: !!grantProposal?.grant },
    )
  const handleSuccess = useCallback(() => {
    refetch()
    refetchList()
    refetchProposals()
  }, [refetch, refetchList, refetchProposals])
  const currentIndex = useMemo(
    () =>
      grantProposals
        ? grantProposals.findIndex(
            ({ permalink, selected }) =>
              (grant?.permission.selecting ? selected : true) &&
              permalink === grantProposal?.permalink,
          )
        : -1,
    [grant?.permission.selecting, grantProposal?.permalink, grantProposals],
  )
  const { data: status } = useStatus(grantProposal?.grant)
  const now = useNow()
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, grant?.duration),
    [grant?.duration, now, status?.timestamp],
  )
  const { width, height } = useWindowSize()
  const { data: dids } = useDids(account)
  const isAuthor = useMemo(
    () =>
      !!grantProposal &&
      !!dids?.find((did) => did === grantProposal?.authorship?.author),
    [dids, grantProposal],
  )
  const { data: showSelect } = useQuery(
    [dids, grant],
    async () => {
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(grant!.permission.selecting!, did, grant!.snapshots),
        { concurrency: 5 },
      )
      return booleans.some((boolean) => boolean)
    },
    {
      enabled:
        !!dids &&
        !!grant?.permission.selecting &&
        phase === GrantPhase.PROPOSING,
    },
  )
  const funding = grantProposals?.[currentIndex]?.funding

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:creator" content={`@${twitterHandle}`} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:title" property="og:title" content={title} />
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />
        <meta key="og:site_name" property="og:site_name" content={title} />
        <meta key="og:image" property="og:image" content={image} />
      </Head>
      <LoadingBar
        loading={isFetching || isGrantLoading || isCommunityLoading}
      />
      {funding && isAuthor ? (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={(width * height) / 1500}
          tweenDuration={15000}
          recycle={false}
        />
      ) : null}

      <Container hasSidebar>
        <Main>
          <div className="mb-5 flex items-end justify-between">
            <Back
              disabled={!community || !grantProposal || !!previewGrantProposal}
              href={
                community?.id
                  ? `/${formatDid(community.id)}/grant/${
                      grantProposal ? permalink2Id(grantProposal.grant) : ''
                    }`
                  : '#'
              }
            />

            {grantProposals && currentIndex !== -1 && !previewGrantProposal ? (
              <div className="flex items-center gap-4">
                {currentIndex >= 0 ? (
                  <p className="text-sm-regular text-subtle">
                    {currentIndex + 1} of {grantProposals.length}
                  </p>
                ) : null}

                <span className="flex items-center gap-2">
                  {currentIndex > 0 ? (
                    <Link
                      href={`/grant-proposal/${permalink2Id(
                        grantProposals[currentIndex - 1]!.permalink,
                      )}`}
                    >
                      <Button
                        className={pagingButtonClass()}
                        icon={ChevronLeftIcon}
                        outline
                      />
                    </Link>
                  ) : (
                    <Button
                      className={pagingButtonClass()}
                      disabled
                      icon={ChevronLeftIcon}
                      outline
                    />
                  )}

                  {currentIndex < grantProposals.length - 1 ? (
                    <Link
                      href={`/grant-proposal/${permalink2Id(
                        grantProposals[currentIndex + 1]!.permalink,
                      )}`}
                    >
                      <Button
                        className={pagingButtonClass()}
                        icon={ChevronRightIcon}
                        outline
                      />
                    </Link>
                  ) : (
                    <Button
                      className={pagingButtonClass()}
                      disabled
                      icon={ChevronRightIcon}
                      outline
                    />
                  )}
                </span>
              </div>
            ) : null}
          </div>

          {isFetching || isGrantLoading || isCommunityLoading ? (
            <ArticleSkeleton />
          ) : (
            <Card size="medium">
              <Article>
                <h1>{grantProposal?.title || '...'}</h1>

                {funding ? (
                  <div className="flex items-center">
                    <Tag className="mr-2" color="highlight" round>
                      <CrownIcon className="h-5 w-5" />

                      <span>WON</span>
                    </Tag>

                    <div className="space-x-1 text-sm">
                      <span>This proposal won</span>

                      <span className="font-bold text-highlight">
                        {funding}
                      </span>
                    </div>
                  </div>
                ) : null}

                {grant && grantProposal ? (
                  phase === GrantPhase.PROPOSING &&
                  grant.permission.selecting &&
                  !grantProposal.selected ? (
                    <Tag round>Awaiting Selection</Tag>
                  ) : grant.permission.selecting && !grantProposal.selected ? (
                    <Tag round>Not Selected</Tag>
                  ) : null
                ) : null}

                <MarkdownViewer preview={!!previewGrantProposal}>
                  {grantProposal?.content}
                </MarkdownViewer>
              </Article>
            </Card>
          )}

          <GrantProposalInfo
            community={community || undefined}
            grant={grant || undefined}
            grantProposal={grantProposal}
            className="block sm:hidden"
          />

          {grant && grantProposal ? (
            phase === GrantPhase.PROPOSING &&
            grant.permission.selecting &&
            !grantProposal.selected ? (
              showSelect ? (
                <GrantProposalSelectForm
                  grant={grant}
                  grantProposal={grantProposal}
                  onSuccess={handleSuccess}
                />
              ) : null
            ) : grant.permission.selecting && !grantProposal.selected ? null : (
              <GrantProposalVoteForm
                grant={grant}
                grantProposal={grantProposal}
                onSuccess={handleSuccess}
              />
            )
          ) : null}

          {grantProposalVotes?.length ? (
            <Card
              title={
                grantProposal
                  ? grantProposal.votes === 1
                    ? '1 Vote'
                    : `${grantProposal.votes} Votes`
                  : ''
              }
            >
              <Table
                headers={[
                  {
                    label: 'Voter',
                  },
                  {
                    label: 'Power',
                    className: 'text-right',
                  },
                ]}
              >
                {grantProposalVotes.map((grantProposalVote) => (
                  <TableRow key={grantProposalVote.permalink}>
                    <TableCell>
                      {formatDid(grantProposalVote.authorship.author)}
                    </TableCell>

                    <TableCell className="text-right">
                      <TextLink
                        primary
                        disabled={!!previewGrantProposal}
                        href={permalink2Explorer(grantProposalVote.permalink)}
                      >
                        {grantProposalVote.total_power}
                      </TextLink>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
              <div ref={ref} />
            </Card>
          ) : null}
        </Main>

        <Sidebar className="hidden sm:block">
          {isFetching || isGrantLoading || isCommunityLoading ? (
            <SidebarInfoSkeleton />
          ) : (
            <GrantProposalInfo
              community={community || undefined}
              grant={grant || undefined}
              grantProposal={grantProposal}
            />
          )}
        </Sidebar>
      </Container>
    </>
  )
}
