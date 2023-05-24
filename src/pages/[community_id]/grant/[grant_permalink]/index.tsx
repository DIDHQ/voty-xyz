import { useMemo } from 'react'
import { compact } from 'lodash-es'
import Head from 'next/head'
import { useAtomValue } from 'jotai'

import { trpc } from '../../../../utils/trpc'
import Article from '../../../../components/basic/article'
import TextLink from '../../../../components/basic/text-link'
import LoadingBar from '../../../../components/basic/loading-bar'
import { documentTitle, previewPermalink } from '../../../../utils/constants'
import useRouterQuery from '../../../../hooks/use-router-query'
import MarkdownViewer from '../../../../components/basic/markdown-viewer'
import GrantInfo from '../../../../components/grant-info'
import { previewGrantAtom } from '../../../../utils/atoms'
import { Grant } from '../../../../utils/schemas/v1/grant'
import GrantProposalCard from '../../../../components/grant-proposal-card'
import GrantProposalCreateButton from '../../../../components/grant-proposal-create-button'
import { GrantPhase, getGrantPhase } from '../../../../utils/phase'
import useStatus from '../../../../hooks/use-status'
import useNow from '../../../../hooks/use-now'

export default function GrantPage() {
  const query = useRouterQuery<['community_id', 'grant_permalink']>()
  const previewGrant = useAtomValue(previewGrantAtom)
  const { data, isLoading } = trpc.grant.getByPermalink.useQuery(
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
  const { data: grantProposals } = trpc.grantProposal.list.useQuery(
    { grantPermalink: query.grant_permalink },
    { enabled: !!query.grant_permalink },
  )
  const title = useMemo(
    () => compact([grant?.name, community?.name, documentTitle]).join(' - '),
    [community?.name, grant?.name],
  )
  const { data: status } = useStatus(grant?.permalink)
  const now = useNow()
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, grant?.duration),
    [grant?.duration, now, status?.timestamp],
  )

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <LoadingBar loading={isLoading || isCommunityLoading} />
      <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
        <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
          <TextLink
            disabled={!community || !!previewGrant}
            href={`/${community?.id}/grant`}
            className="inline-block"
          >
            <h2 className="text-base font-semibold">← Back</h2>
          </TextLink>
          <Article className="my-6 sm:my-8">
            <h1>{grant?.name || '...'}</h1>
            <MarkdownViewer>{grant?.introduction}</MarkdownViewer>
          </Article>
          <GrantInfo
            community={community || undefined}
            grant={grant}
            className="mb-6 block sm:hidden"
          />
          {previewGrant ? null : (
            <div className="my-6 flex items-center justify-between border-t border-gray-200 pt-6">
              {grant?.proposals ? (
                <h2 className="text-2xl font-bold">
                  {grant.proposals === 1
                    ? '1 Proposal'
                    : `${grant.proposals} Proposals`}
                </h2>
              ) : (
                <h2 />
              )}
              <GrantProposalCreateButton
                communityId={query.community_id}
                grant={grant}
              />
            </div>
          )}
          {grantProposals?.length ? (
            <ul className="mt-5 space-y-5">
              {grantProposals.map((grantProposal, index) => (
                <li key={grantProposal.permalink}>
                  {query.community_id ? (
                    <GrantProposalCard
                      communityId={query.community_id}
                      grantProposal={grantProposal}
                      funding={
                        phase === GrantPhase.ENDED &&
                        !!grant &&
                        index < grant.funding[0][1]
                          ? grant.funding[0][0]
                          : undefined
                      }
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
    </>
  )
}
