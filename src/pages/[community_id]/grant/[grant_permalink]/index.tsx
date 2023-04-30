import { useCallback, useEffect, useMemo } from 'react'
import { compact } from 'lodash-es'
import { useInView } from 'react-intersection-observer'
import Head from 'next/head'
import { useAtomValue } from 'jotai'

import { trpc } from '../../../../utils/trpc'
import Article from '../../../../components/basic/article'
import TextButton from '../../../../components/basic/text-button'
import LoadingBar from '../../../../components/basic/loading-bar'
import { documentTitle, previewPermalink } from '../../../../utils/constants'
import useRouterQuery from '../../../../hooks/use-router-query'
import Markdown from '../../../../components/basic/markdown'
import GrantInfo from '../../../../components/grant-info'
import { previewGrantAtom } from '../../../../utils/atoms'
import { Grant } from '../../../../utils/schemas/grant'
import GrantProposalCard from '../../../../components/grant-proposal-card'
import GrantProposalCreateButton from '../../../../components/grant-proposal-create-button'

export default function GrantPage() {
  const query = useRouterQuery<['community_id', 'grant_permalink']>()
  const previewGrant = useAtomValue(previewGrantAtom)
  const { data, isLoading, refetch } = trpc.grant.getByPermalink.useQuery(
    { permalink: query.grant_permalink },
    { enabled: !!query.grant_permalink },
  )
  const grant = useMemo<
    | (Grant & {
        proposals: number
        permalink: string
        authorship?: { author?: string }
      })
    | undefined
  >(() => {
    if (previewGrant) {
      return {
        ...previewGrant,
        proposals: 0,
        permalink: previewPermalink,
        authorship: { author: previewGrant.preview.author },
      }
    }
    return query.grant_permalink && data
      ? { ...data, permalink: query.grant_permalink }
      : undefined
  }, [data, previewGrant, query.grant_permalink])
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
  } = trpc.grantProposal.list.useInfiniteQuery(
    { grantPermalink: query.grant_permalink },
    {
      enabled: !!query.grant_permalink,
      getNextPageParam: ({ next }) => next,
    },
  )
  const grantProposals = useMemo(
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
    () => compact([grant?.name, community?.name, documentTitle]).join(' - '),
    [community?.name, grant?.name],
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
        <LoadingBar loading={isLoading || isCommunityLoading} />
        <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
          <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
            <TextButton
              disabled={!community || !!previewGrant}
              href={`/${community?.id}/grant`}
            >
              <h2 className="text-base font-semibold">← Back</h2>
            </TextButton>
            <div className="mb-6">
              <h3 className="mt-4 line-clamp-2 break-words text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {grant?.name || '...'}
              </h3>
              <Article className="mt-6 sm:mt-8">
                <Markdown>{grant?.extension?.introduction}</Markdown>
              </Article>
            </div>
            <GrantInfo
              community={community || undefined}
              grant={grant}
              className="mb-6 block sm:hidden"
            />
            <GrantProposalCreateButton
              communityId={query.community_id}
              grant={grant}
              className="my-6 flex justify-end border-t border-gray-200 pt-6"
            />
            {grant?.proposals ? (
              <h2 className="my-6 border-t border-gray-200 pt-6 text-2xl font-bold">
                {grant.proposals === 1
                  ? '1 Proposal'
                  : `${grant.proposals} Proposals`}
              </h2>
            ) : null}
            {grantProposals?.length ? (
              <ul role="list" className="mt-5 space-y-5">
                {grantProposals.map((grantProposal) => (
                  <li key={grantProposal.permalink}>
                    {query.community_id ? (
                      <GrantProposalCard
                        communityId={query.community_id}
                        grantProposal={grantProposal}
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <GrantInfo
            community={community || undefined}
            grant={grant}
            className="hidden sm:block"
          />
        </div>
        <div ref={ref} />
      </div>
    </>
  )
}
