import { useCallback, useEffect, useMemo } from 'react'
import { clsx } from 'clsx'
import { compact, last } from 'remeda'
import { useInView } from 'react-intersection-observer'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { GetServerSideProps } from 'next'
import { SuperJSON } from 'superjson'

import { stringifyChoice } from '@/src/utils/choice'
import {
  id2Permalink,
  isPermalink,
  permalink2Explorer,
  permalink2Gateway,
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
import GroupProposalVoteForm from '@/src/components/group-proposal-vote-form'
import useRouterQuery from '@/src/hooks/use-router-query'
import MarkdownViewer from '@/src/components/basic/markdown-viewer'
import GroupProposalInfo from '@/src/components/group-proposal-info'
import { previewGroupProposalAtom } from '@/src/utils/atoms'
import { GroupProposal } from '@/src/utils/schemas/v1/group-proposal'
import { formatDid } from '@/src/utils/did/utils'
import { parseImage, parseRoot, parseContent } from '@/src/utils/markdown'
import { appRouter } from '@/src/server/routers/_app'

export const runtime = 'experimental-edge'

export const getServerSideProps: GetServerSideProps<
  Record<string, unknown>
> = async (context) => {
  // @see https://github.com/cloudflare/next-on-pages/issues/32
  const id = last(context.req.url?.split('/') || [])?.split('?')[0]
  if (id === previewPermalink) {
    return { props: {} }
  }
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: SuperJSON,
  })
  if (id) {
    await helpers.groupProposal.getByPermalink.prefetch({
      permalink: id2Permalink(id),
    })
  }
  context.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  return { props: {} }
}

export default function GroupProposalPage() {
  const query = useRouterQuery<['groupProposalPermalink']>()
  const previewGroupProposal = useAtomValue(previewGroupProposalAtom)
  const { data, isFetching, refetch } =
    trpc.groupProposal.getByPermalink.useQuery(
      { permalink: query.groupProposalPermalink },
      { enabled: !!query.groupProposalPermalink },
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
    return query.groupProposalPermalink && data
      ? { ...data, permalink: query.groupProposalPermalink }
      : undefined
  }, [data, previewGroupProposal, query.groupProposalPermalink])
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
    { groupProposal: query.groupProposalPermalink },
    {
      enabled: !!query.groupProposalPermalink,
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
  const root = useMemo(
    () => parseRoot(groupProposal?.content),
    [groupProposal?.content],
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
  const handleSuccess = useCallback(() => {
    refetch()
    refetchList()
  }, [refetch, refetchList])

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
        loading={isFetching || isGroupLoading || isCommunityLoading}
      />
      <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
        <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
          <TextLink
            disabled={!community || !group || !!previewGroupProposal}
            href={`/${community?.id}/group/${group?.id}`}
            className="inline-block"
          >
            <h2 className="text-base font-semibold">← Back</h2>
          </TextLink>
          <Article className="my-6 sm:my-8">
            <h1>{groupProposal?.title || '...'}</h1>
            <MarkdownViewer preview={!!previewGroupProposal}>
              {groupProposal?.content}
            </MarkdownViewer>
          </Article>
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
                      {formatDid(groupProposalVote.authorship.author)}
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
                      <TextLink
                        primary
                        disabled={!!previewGroupProposal}
                        href={permalink2Explorer(groupProposalVote.permalink)}
                      >
                        {groupProposalVote.total_power}
                      </TextLink>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot ref={ref} />
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
    </>
  )
}
