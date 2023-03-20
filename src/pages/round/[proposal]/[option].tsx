import { useCallback, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import { useInView } from 'react-intersection-observer'
import Head from 'next/head'
import Decimal from 'decimal.js'

import useGroup from '../../../hooks/use-group'
import { permalink2Explorer, permalink2Id } from '../../../utils/permalink'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'
import TextButton from '../../../components/basic/text-button'
import LoadingBar from '../../../components/basic/loading-bar'
import { documentTitle } from '../../../utils/constants'
import VoteForm from '../../../components/vote-form'
import useRouterQuery from '../../../hooks/use-router-query'
import Markdown from '../../../components/basic/markdown'
import ProposalInfo from '../../../components/proposal-info'
import { powerOfChoice } from '../../../utils/choice'

export default function OptionPage() {
  const query = useRouterQuery<['proposal', 'option']>()
  const { data: option, isLoading } = trpc.option.getByPermalink.useQuery(
    { permalink: query.option },
    { enabled: !!query.option, refetchOnWindowFocus: false },
  )
  const {
    data: power,
    refetch,
    isLoading: isPowerLoading,
  } = trpc.choice.get.useQuery(
    { proposal: query.proposal, option: query.option },
    { enabled: !!query.proposal && !!query.option },
  )
  const { data: proposal, isLoading: isProposalLoading } =
    trpc.proposal.getByPermalink.useQuery(
      { permalink: query.proposal },
      { enabled: !!query.proposal, refetchOnWindowFocus: false },
    )
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: proposal?.community },
      { enabled: !!proposal?.community, refetchOnWindowFocus: false },
    )
  const group = useGroup(community, proposal?.group, 'grant')
  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch: refetchList,
  } = trpc.vote.list.useInfiniteQuery(
    { proposal: query.proposal },
    { enabled: !!query.proposal, getNextPageParam: ({ next }) => next },
  )
  const votes = useMemo(
    () =>
      data?.pages
        .flatMap(({ data }) =>
          data.map((vote) => ({
            ...vote,
            power:
              query.option && proposal
                ? powerOfChoice(
                    proposal.voting_type,
                    vote.choice,
                    new Decimal(vote.power),
                  )[query.option]
                : undefined,
          })),
        )
        .filter((vote) => vote.power?.gt(0)),
    [data?.pages, proposal, query.option],
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
        option?.title,
        group?.name,
        community?.name,
        documentTitle,
      ]).join(' - '),
    [community?.name, option?.title, group?.name],
  )
  const handleSuccess = useCallback(() => {
    refetch()
    refetchList()
  }, [refetch, refetchList])

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="w-full">
        <LoadingBar
          loading={
            isLoading ||
            isPowerLoading ||
            isProposalLoading ||
            isCommunityLoading
          }
        />
        <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
          <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
            <TextButton
              disabled={!query.proposal}
              href={
                query.proposal
                  ? `/round/${permalink2Id(query.proposal)}`
                  : undefined
              }
            >
              <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
            </TextButton>
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h3 className="mt-4 break-words text-3xl font-bold leading-8 tracking-tight text-gray-900 line-clamp-2 sm:text-4xl">
                {option?.title || '...'}
              </h3>
              <Article className="mt-6 sm:mt-8">
                <Markdown>{option?.extension?.content}</Markdown>
              </Article>
            </div>
            <ProposalInfo
              proposal={proposal || undefined}
              option={option || undefined}
              className="mb-6 block sm:hidden"
            />
            <VoteForm
              defaultOption={query.option}
              entry={community?.authorship.author}
              proposal={proposal || undefined}
              group={group}
              onSuccess={handleSuccess}
            />
            {power ? (
              <h2 className="my-6 border-t border-gray-200 pt-6 text-2xl font-bold">
                {power.power} Power
              </h2>
            ) : null}
            {votes?.length ? (
              <table className="my-6 w-full border-separate border-spacing-0 rounded-md border border-gray-200">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-18 rounded-t-md border-r border-b border-gray-200 bg-white/80 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      DID
                    </th>
                    <th
                      scope="col"
                      className="sticky top-18 rounded-t-md border-b border-gray-200 bg-white/80 py-2 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 backdrop-blur"
                    >
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
                          'truncate whitespace-nowrap border-r border-gray-200 py-2 pl-4 pr-3 text-sm font-medium text-gray-900',
                        )}
                      >
                        {vote.authorship.author}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 py-2 pl-3 pr-4 text-right text-sm font-medium',
                        )}
                      >
                        <TextButton
                          primary
                          href={permalink2Explorer(vote.permalink)}
                        >
                          {vote.power?.toString()}
                        </TextButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <ProposalInfo
            proposal={proposal || undefined}
            option={option || undefined}
            className="hidden sm:block"
          />
        </div>
        <div ref={ref} />
      </div>
    </>
  )
}
