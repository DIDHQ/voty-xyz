import { useCallback, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import { useInView } from 'react-intersection-observer'
import Head from 'next/head'
import { useAtomValue } from 'jotai'

import { stringifyChoice, totalPower } from '../../utils/choice'
import { permalink2Explorer } from '../../utils/permalink'
import { trpc } from '../../utils/trpc'
import Article from '../../components/basic/article'
import TextButton from '../../components/basic/text-button'
import LoadingBar from '../../components/basic/loading-bar'
import { documentTitle, previewPermalink } from '../../utils/constants'
import GroupProposalVoteForm from '../../components/group-proposal-vote-form'
import useRouterQuery from '../../hooks/use-router-query'
import Markdown from '../../components/basic/markdown'
import GroupProposalInfo from '../../components/group-proposal-info'
import { previewGroupProposalAtom } from '../../utils/atoms'
import { GroupProposal } from '../../utils/schemas/group-proposal'

export default function ProposalPage() {
  const query = useRouterQuery<['group_proposal_permalink']>()
  const previewGroupProposal = useAtomValue(previewGroupProposalAtom)
  const { data, isLoading, refetch } =
    trpc.groupProposal.getByPermalink.useQuery(
      { permalink: query.group_proposal_permalink },
      { enabled: !!query.group_proposal_permalink },
    )
  const groupProposal = useMemo<
    | (GroupProposal & {
        votes: number
        permalink: string
        authorship?: { author?: string }
      })
    | undefined
  >(() => {
    if (previewGroupProposal) {
      return {
        ...previewGroupProposal,
        votes: 0,
        permalink: previewPermalink,
        authorship: { author: previewGroupProposal.preview.author },
      }
    }
    return query.group_proposal_permalink && data
      ? { ...data, permalink: query.group_proposal_permalink }
      : undefined
  }, [data, previewGroupProposal, query.group_proposal_permalink])
  const { data: group, isLoading: isGroupLoading } =
    trpc.group.getByPermalink.useQuery(
      { permalink: groupProposal?.group },
      { enabled: !!groupProposal?.group, refetchOnWindowFocus: false },
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
  } = trpc.groupProposalVote.list.useInfiniteQuery(
    { groupProposal: query.group_proposal_permalink },
    {
      enabled: !!query.group_proposal_permalink,
      getNextPageParam: ({ next }) => next,
    },
  )
  const groupProposalVotes = useMemo(
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
        groupProposal?.title,
        group?.name,
        community?.name,
        documentTitle,
      ]).join(' - '),
    [community?.name, groupProposal?.title, group?.name],
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
          loading={isLoading || isGroupLoading || isCommunityLoading}
        />
        <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
          <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
            <TextButton
              disabled={!community || !group || !!previewGroupProposal}
              href={`/${community?.id}/${group?.id}`}
            >
              <h2 className="text-base font-semibold">← Back</h2>
            </TextButton>
            <div className="mb-6">
              <h3 className="mt-4 line-clamp-2 break-words text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {groupProposal?.title || '...'}
              </h3>
              <Article className="mt-6 sm:mt-8">
                <Markdown>{groupProposal?.extension?.content}</Markdown>
              </Article>
            </div>
            <GroupProposalInfo
              community={community || undefined}
              group={group || undefined}
              groupProposal={groupProposal}
              className="mb-6 block sm:hidden"
            />
            {group && groupProposal ? (
              <GroupProposalVoteForm
                group={group}
                groupProposal={groupProposal}
                onSuccess={handleSuccess}
              />
            ) : null}
            {groupProposal?.votes ? (
              <h2 className="my-6 border-t border-gray-200 pt-6 text-2xl font-bold">
                {groupProposal.votes === 1
                  ? '1 Vote'
                  : `${groupProposal.votes} Votes`}
              </h2>
            ) : null}
            {groupProposalVotes?.length ? (
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
                  {groupProposalVotes.map((groupProposalVote, index) => (
                    <tr key={groupProposalVote.permalink}>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 py-2 pl-4 pr-3 text-sm font-medium text-gray-900',
                        )}
                      >
                        {groupProposalVote.authorship.author}
                      </td>
                      <td
                        title={stringifyChoice(groupProposalVote.powers)}
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 px-3 py-2 text-sm text-gray-500',
                        )}
                      >
                        {stringifyChoice(groupProposalVote.powers)}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 py-2 pl-3 pr-4 text-right text-sm font-medium',
                        )}
                      >
                        <TextButton
                          primary
                          disabled={!!previewGroupProposal}
                          href={permalink2Explorer(groupProposalVote.permalink)}
                        >
                          {totalPower(groupProposalVote.powers)}
                        </TextButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <GroupProposalInfo
            community={community || undefined}
            group={group || undefined}
            groupProposal={groupProposal}
            className="hidden sm:block"
          />
        </div>
        <div ref={ref} />
      </div>
    </>
  )
}
