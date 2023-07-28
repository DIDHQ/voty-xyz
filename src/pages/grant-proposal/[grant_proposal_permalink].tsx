import { useCallback, useEffect, useMemo } from 'react'
import { clsx } from 'clsx'
import { compact } from 'lodash-es'
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
import { GetServerSidePropsContext } from 'next'
import { SuperJSON } from 'superjson'

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
import { getImages, getSummary } from '@/src/utils/markdown'
import { appRouter } from '@/src/server/routers/_app'

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ grant_proposal_permalink: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: SuperJSON,
  })
  if (context.params?.grant_proposal_permalink) {
    await helpers.grantProposal.getByPermalink.prefetch({
      permalink: id2Permalink(context.params?.grant_proposal_permalink),
    })
  }
  context.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  return { props: { trpcState: helpers.dehydrate() } }
}

export default function GrantProposalPage() {
  const query = useRouterQuery<['grant_proposal_permalink']>()
  const previewGrantProposal = useAtomValue(previewGrantProposalAtom)
  const { data, isLoading, refetch } =
    trpc.grantProposal.getByPermalink.useQuery(
      { permalink: query.grant_proposal_permalink },
      { enabled: !!query.grant_proposal_permalink },
    )
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
    return query.grant_proposal_permalink && data
      ? { ...data, permalink: query.grant_proposal_permalink }
      : undefined
  }, [data, previewGrantProposal, query.grant_proposal_permalink])
  const { data: grant, isLoading: isGrantLoading } =
    trpc.grant.getByPermalink.useQuery(
      { permalink: grantProposal?.grant },
      { enabled: !!grantProposal?.grant, refetchOnWindowFocus: false },
    )
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: grant?.community },
      { enabled: !!grant?.community, refetchOnWindowFocus: false },
    )
  const {
    data: list,
    fetchNextPage,
    hasNextPage,
    refetch: refetchList,
  } = trpc.grantProposalVote.list.useInfiniteQuery(
    { grantProposal: query.grant_proposal_permalink },
    {
      enabled: !!query.grant_proposal_permalink,
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
  const description = useMemo(
    () =>
      grantProposal?.content
        ? getSummary(grantProposal?.content)
        : documentDescription,
    [grantProposal?.content],
  )
  const image = useMemo(() => {
    const image = getImages(grantProposal?.content || '')[0]
    if (!image) {
      return documentImage
    }
    return isPermalink(image) ? permalink2Gateway(image) : image
  }, [grantProposal?.content])
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
      <LoadingBar loading={isLoading || isGrantLoading || isCommunityLoading} />
      {funding && isAuthor ? (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={(width * height) / 1500}
          tweenDuration={15000}
          recycle={false}
        />
      ) : null}
      <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
        <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
          {grantProposals && currentIndex !== -1 && !previewGrantProposal ? (
            <div className="float-right flex items-center">
              {currentIndex >= 0 ? (
                <p className="mr-4 text-sm text-gray-600">
                  {currentIndex + 1} of {grantProposals.length}
                </p>
              ) : null}
              <span className="isolate inline-flex rounded-md">
                {currentIndex > 0 ? (
                  <Link
                    href={`/grant-proposal/${permalink2Id(
                      grantProposals[currentIndex - 1].permalink,
                    )}`}
                  >
                    <button
                      type="button"
                      className="relative inline-flex items-center rounded-l-md bg-white p-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="relative inline-flex cursor-not-allowed items-center rounded-l-md bg-gray-100 p-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-10"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                )}
                {currentIndex < grantProposals.length - 1 ? (
                  <Link
                    href={`/grant-proposal/${permalink2Id(
                      grantProposals[currentIndex + 1].permalink,
                    )}`}
                  >
                    <button
                      type="button"
                      className="relative -ml-px inline-flex items-center rounded-r-md bg-white p-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="relative -ml-px inline-flex cursor-not-allowed items-center rounded-r-md bg-gray-100 p-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-10"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                )}
              </span>
            </div>
          ) : null}
          <TextLink
            disabled={!community || !grantProposal || !!previewGrantProposal}
            href={`/${community?.id}/grant/${
              grantProposal ? permalink2Id(grantProposal.grant) : ''
            }`}
            className="inline-block"
          >
            <h2 className="text-base font-semibold">← Back</h2>
          </TextLink>
          <Article className="my-6 sm:my-8">
            <h1>{grantProposal?.title || '...'}</h1>
            {funding ? (
              <div className="flex items-center space-x-1 text-sm">
                <span className="mr-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-700">
                  <CrownIcon className="mr-1 h-5 w-5 text-amber-700" />
                  WON
                </span>
                <span>This proposal won</span>
                <span className="font-bold text-gray-900">{funding}</span>
              </div>
            ) : null}
            <MarkdownViewer preview={!!previewGrantProposal}>
              {grantProposal?.content}
            </MarkdownViewer>
          </Article>
          <GrantProposalInfo
            community={community || undefined}
            grant={grant || undefined}
            grantProposal={grantProposal}
            className="mb-6 block sm:hidden"
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
              ) : (
                <p className="text-end text-gray-400">
                  This proposal has not been selected by the grant committee for
                  voting yet.
                </p>
              )
            ) : grant.permission.selecting && !grantProposal.selected ? (
              <p className="text-end text-gray-400">
                This proposal has not been selected by the grant committee for
                voting.
              </p>
            ) : (
              <GrantProposalVoteForm
                grant={grant}
                grantProposal={grantProposal}
                onSuccess={handleSuccess}
              />
            )
          ) : null}
          {grantProposal?.votes ? (
            <h2 className="my-6 border-t border-gray-200 pt-6 text-2xl font-bold">
              {grantProposal.votes === 1
                ? '1 Vote'
                : `${grantProposal.votes} Votes`}
            </h2>
          ) : null}
          {grantProposalVotes?.length ? (
            <table className="my-6 w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="rounded-t-md border-b border-gray-200 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Voter
                  </th>
                  <th className="rounded-t-md border-b border-gray-200 py-2 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">
                    Power
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grantProposalVotes.map((grantProposalVote, index) => (
                  <tr key={grantProposalVote.permalink}>
                    <td
                      className={clsx(
                        index === 0 ? undefined : 'border-t',
                        'truncate whitespace-nowrap border-gray-200 py-2 pl-4 pr-3 text-sm font-medium text-gray-900',
                      )}
                    >
                      {formatDid(grantProposalVote.authorship.author)}
                    </td>
                    <td
                      className={clsx(
                        index === 0 ? undefined : 'border-t',
                        'truncate whitespace-nowrap border-gray-200 py-2 pl-3 pr-4 text-right text-sm font-medium',
                      )}
                    >
                      <TextLink
                        primary
                        disabled={!!previewGrantProposal}
                        href={permalink2Explorer(grantProposalVote.permalink)}
                      >
                        {grantProposalVote.total_power}
                      </TextLink>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot ref={ref} />
            </table>
          ) : null}
        </div>
        <GrantProposalInfo
          community={community || undefined}
          grant={grant || undefined}
          grantProposal={grantProposal}
          className="hidden sm:block"
        />
      </div>
    </>
  )
}
