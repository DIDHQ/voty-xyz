import { useCallback, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import { useInView } from 'react-intersection-observer'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { stringifyChoice } from '../../utils/choice'
import { permalink2Explorer } from '../../utils/permalink'
import { trpc } from '../../utils/trpc'
import Article from '../../components/basic/article'
import TextButton from '../../components/basic/text-button'
import LoadingBar from '../../components/basic/loading-bar'
import { documentTitle, previewPermalink } from '../../utils/constants'
import VoteForm from '../../components/vote-form'
import useRouterQuery from '../../hooks/use-router-query'
import Markdown from '../../components/basic/markdown'
import ProposalInfo from '../../components/proposal-info'
import { previewProposalAtom } from '../../utils/atoms'
import { Proposal } from '../../utils/schemas/proposal'

export default function ProposalPage() {
  const query = useRouterQuery<['proposal']>()
  const router = useRouter()
  const previewProposal = useAtomValue(previewProposalAtom)
  const { data, isLoading, refetch } = trpc.proposal.getByPermalink.useQuery(
    { permalink: query.proposal },
    { enabled: !!query.proposal },
  )
  const proposal = useMemo<
    | (Proposal & { permalink: string; authorship?: { author?: string } })
    | undefined
  >(() => {
    if (previewProposal) {
      return {
        ...previewProposal,
        permalink: previewPermalink,
        authorship: { author: previewProposal.preview.author },
      }
    }
    return query.proposal && data
      ? { ...data, permalink: query.proposal }
      : undefined
  }, [data, previewProposal, query.proposal])
  const { data: group, isLoading: isGroupLoading } =
    trpc.group.getByPermalink.useQuery(
      { permalink: proposal?.group },
      { enabled: !!proposal?.group, refetchOnWindowFocus: false },
    )
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: group?.community },
      { enabled: !!group?.community, refetchOnWindowFocus: false },
    )
  const {
    data: list,
    fetchNextPage,
    hasNextPage,
    refetch: refetchList,
  } = trpc.vote.list.useInfiniteQuery(
    { proposal: query.proposal },
    { enabled: !!query.proposal, getNextPageParam: ({ next }) => next },
  )
  const votes = useMemo(() => list?.pages.flatMap(({ data }) => data), [list])
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])
  const title = useMemo(
    () =>
      compact([
        proposal?.title,
        group?.name,
        community?.name,
        documentTitle,
      ]).join(' - '),
    [community?.name, proposal?.title, group?.name],
  )
  const handleSuccess = useCallback(async () => {
    await Promise.all([refetch(), refetchList()])
    setTimeout(() => {
      router.reload()
    }, 5000)
  }, [refetch, refetchList, router])

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="w-full">
        <LoadingBar
          loading={isLoading || isGroupLoading || isCommunityLoading}
        />
        <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
          <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
            <TextButton
              disabled={!community || !group || !!previewProposal}
              href={`/${community?.authorship.author}/${group?.id}`}
            >
              <h2 className="text-base font-semibold">← Back</h2>
            </TextButton>
            <div className="mb-6">
              <h3 className="mt-4 line-clamp-2 break-words text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {proposal?.title || '...'}
              </h3>
              <Article className="mt-6 sm:mt-8">
                <Markdown>{proposal?.extension?.content}</Markdown>
              </Article>
            </div>
            <ProposalInfo
              community={community || undefined}
              proposal={proposal}
              className="mb-6 block sm:hidden"
            />
            {community && group && proposal ? (
              <VoteForm
                group={group}
                proposal={proposal}
                onSuccess={handleSuccess}
              />
            ) : null}
            {proposal && 'votes' in proposal && proposal?.votes ? (
              <h2 className="my-6 border-t border-gray-200 pt-6 text-2xl font-bold">
                {proposal.votes === 1 ? '1 Vote' : `${proposal.votes} Votes`}
              </h2>
            ) : null}
            {votes?.length ? (
              <table className="my-6 w-full table-fixed border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="rounded-t-md border-b border-gray-200 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Voter
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                      Choice
                    </th>
                    <th className="rounded-t-md border-b border-gray-200 py-2 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">
                      Power
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {votes.map((vote, index) => (
                    <tr key={vote.permalink}>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 py-2 pl-4 pr-3 text-sm font-medium text-gray-900',
                        )}
                      >
                        {vote.authorship.author}
                      </td>
                      <td
                        title={
                          proposal
                            ? stringifyChoice(proposal.voting_type, vote.choice)
                            : vote.choice
                        }
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 px-3 py-2 text-sm text-gray-500',
                        )}
                      >
                        {proposal
                          ? stringifyChoice(proposal.voting_type, vote.choice)
                          : vote.choice}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 py-2 pl-3 pr-4 text-right text-sm font-medium',
                        )}
                      >
                        <TextButton
                          primary
                          disabled={!!previewProposal}
                          href={permalink2Explorer(vote.permalink)}
                        >
                          {vote.power}
                        </TextButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <ProposalInfo
            community={community || undefined}
            proposal={proposal}
            className="hidden sm:block"
          />
        </div>
        <div ref={ref} />
      </div>
    </>
  )
}
