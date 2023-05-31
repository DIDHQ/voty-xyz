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

import {
  permalink2Explorer,
  permalink2Id,
} from '../../../../../utils/permalink'
import { trpc } from '../../../../../utils/trpc'
import Article from '../../../../../components/basic/article'
import TextLink from '../../../../../components/basic/text-link'
import LoadingBar from '../../../../../components/basic/loading-bar'
import { documentTitle, previewPermalink } from '../../../../../utils/constants'
import useRouterQuery from '../../../../../hooks/use-router-query'
import MarkdownViewer from '../../../../../components/basic/markdown-viewer'
import GrantProposalInfo from '../../../../../components/grant-proposal-info'
import { previewGrantProposalAtom } from '../../../../../utils/atoms'
import { GrantProposal } from '../../../../../utils/schemas/v1/grant-proposal'
import GrantProposalVoteForm from '../../../../../components/grant-proposal-vote-form'
import { GrantPhase, getGrantPhase } from '../../../../../utils/phase'
import useStatus from '../../../../../hooks/use-status'
import useNow from '../../../../../hooks/use-now'
import { formatDid } from '../../../../../utils/did/utils'
import { CrownIcon } from '../../../../../components/icons'
import useWallet from '../../../../../hooks/use-wallet'
import useDids from '../../../../../hooks/use-dids'
import GrantProposalSelectForm from '../../../../../components/grant-proposal-select-form'

export default function GrantProposalPage() {
  const query =
    useRouterQuery<
      ['community_id', 'grant_permalink', 'grant_proposal_permalink']
    >()
  const previewGrantProposal = useAtomValue(previewGrantProposalAtom)
  const { data, isLoading, refetch } =
    trpc.grantProposal.getByPermalink.useQuery(
      { permalink: query.grant_proposal_permalink },
      { enabled: !!query.grant_proposal_permalink },
    )
  const grantProposal = useMemo<
    | (GrantProposal & {
        votes: number
        permalink: string
        authorship?: { author?: string }
      })
    | undefined
  >(() => {
    if (previewGrantProposal) {
      return {
        ...previewGrantProposal,
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
  const handleSuccess = useCallback(() => {
    refetch()
    refetchList()
  }, [refetch, refetchList])
  const { data: grantProposals } = trpc.grantProposal.list.useQuery(
    { grantPermalink: query.grant_permalink },
    { enabled: !!query.grant_permalink },
  )
  const currentIndex = useMemo(
    () =>
      grantProposals?.findIndex(
        ({ permalink }) => permalink === grantProposal?.permalink,
      ),
    [grantProposal?.permalink, grantProposals],
  )
  const { data: status } = useStatus(query.grant_permalink)
  const now = useNow()
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, grant?.duration),
    [grant?.duration, now, status?.timestamp],
  )
  const funding = useMemo(
    () =>
      phase === GrantPhase.ENDED &&
      !!grant &&
      currentIndex !== undefined &&
      currentIndex < grant.funding[0][1]
        ? grant.funding[0][0]
        : undefined,
    [currentIndex, grant, phase],
  )
  const { width, height } = useWindowSize()
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const isAuthor = useMemo(
    () =>
      !!grantProposal &&
      !!dids?.find((did) => did === grantProposal?.authorship?.author),
    [dids, grantProposal],
  )
  const showSelect = useMemo(() => true, [])

  return (
    <>
      <Head>
        <title>{title}</title>
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
          {query.community_id &&
          query.grant_permalink &&
          grantProposals &&
          currentIndex !== undefined &&
          !previewGrantProposal ? (
            <div className="float-right flex items-center">
              {currentIndex >= 0 ? (
                <p className="mr-4 text-sm text-gray-600">
                  {currentIndex + 1} of {grantProposals.length}
                </p>
              ) : null}
              <span className="isolate inline-flex rounded-md">
                {currentIndex > 0 ? (
                  <Link
                    href={`/${query.community_id}/grant/${permalink2Id(
                      query.grant_permalink,
                    )}/proposal/${permalink2Id(
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
                    href={`/${query.community_id}/grant/${permalink2Id(
                      query.grant_permalink,
                    )}/proposal/${permalink2Id(
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
            showSelect ? (
              <GrantProposalSelectForm
                grant={grant}
                grantProposal={grantProposal}
                onSuccess={handleSuccess}
              />
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
      <div ref={ref} />
    </>
  )
}
