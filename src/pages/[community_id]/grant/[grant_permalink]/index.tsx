import { useEffect, useMemo, useState } from 'react'
import { compact } from 'lodash-es'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { useCollapse } from 'react-collapsed'
import SuperJSON from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { GetServerSidePropsContext } from 'next'

import { trpc } from '@/src/utils/trpc'
import Article from '@/src/components/basic/article'
import TextLink from '@/src/components/basic/text-link'
import LoadingBar from '@/src/components/basic/loading-bar'
import {
  documentDescription,
  documentImage,
  documentTitle,
  previewPermalink,
} from '@/src/utils/constants'
import useRouterQuery from '@/src/hooks/use-router-query'
import MarkdownViewer from '@/src/components/basic/markdown-viewer'
import GrantInfo from '@/src/components/grant-info'
import { previewGrantAtom } from '@/src/utils/atoms'
import { Grant } from '@/src/utils/schemas/v1/grant'
import GrantProposalCard from '@/src/components/grant-proposal-card'
import GrantProposalCreateButton from '@/src/components/grant-proposal-create-button'
import { getGrantPhase } from '@/src/utils/phase'
import useStatus from '@/src/hooks/use-status'
import useNow from '@/src/hooks/use-now'
import Select from '@/src/components/basic/select'
import TextButton from '@/src/components/basic/text-button'
import useWallet from '@/src/hooks/use-wallet'
import {
  id2Permalink,
  isPermalink,
  permalink2Gateway,
} from '@/src/utils/permalink'
import { appRouter } from '@/src/server/routers/_app'
import { getImages, getSummary } from '@/src/utils/markdown'

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ grant_permalink: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: SuperJSON,
  })
  if (context.params?.grant_permalink) {
    await helpers.grant.getByPermalink.prefetch({
      permalink: id2Permalink(context.params?.grant_permalink),
    })
  }
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  }
}

export default function GrantPage() {
  const query = useRouterQuery<['community_id', 'grant_permalink']>()
  const previewGrant = useAtomValue(previewGrantAtom)
  const { data, isLoading } = trpc.grant.getByPermalink.useQuery(
    { permalink: query.grant_permalink },
    { enabled: !!query.grant_permalink },
  )
  const grant = useMemo<
    | (Grant & {
        permalink: string
        proposals: number
        selectedProposals: number
        authorship?: { author?: string }
      })
    | undefined
  >(() => {
    if (previewGrant) {
      return {
        ...previewGrant,
        permalink: previewPermalink,
        proposals: 0,
        selectedProposals: 0,
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
  const { account } = useWallet()
  const { data: grantProposals } = trpc.grantProposal.list.useQuery(
    { grantPermalink: query.grant_permalink, viewer: account?.address },
    { enabled: !!query.grant_permalink },
  )
  const title = useMemo(
    () => compact([grant?.name, community?.name, documentTitle]).join(' - '),
    [community?.name, grant?.name],
  )
  const description = useMemo(
    () =>
      grant?.introduction
        ? getSummary(grant?.introduction)
        : documentDescription,
    [grant?.introduction],
  )
  const image = useMemo(() => {
    const image = getImages(grant?.introduction || '')[0]
    if (!image) {
      return documentImage
    }
    return isPermalink(image) ? permalink2Gateway(image) : image
  }, [grant?.introduction])
  const { data: status } = useStatus(grant?.permalink)
  const now = useNow()
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, grant?.duration),
    [grant?.duration, now, status?.timestamp],
  )
  const options = useMemo(() => ['All', 'Selected'], [])
  const [option, setOption] = useState(options[0])
  useEffect(() => {
    setOption(options[grant?.selectedProposals ? 1 : 0])
  }, [grant?.selectedProposals, options])
  const [isExpanded, setExpanded] = useState(false)
  const { getCollapseProps, getToggleProps } = useCollapse({
    isExpanded,
    collapsedHeight: 300,
  })

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:creator" content="@voty_xyz" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content={title} />
        <meta property="og:image" content={image} />
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
          {grant && grant?.introduction.split('\n').length >= 4 ? (
            <>
              <section {...getCollapseProps()}>
                <Article className="my-6 sm:my-8">
                  <h1>{grant?.name || '...'}</h1>
                  <MarkdownViewer preview={!!previewGrant}>
                    {grant?.introduction}
                  </MarkdownViewer>
                </Article>
              </section>
              <TextButton
                secondary
                {...getToggleProps({
                  onClick: () => setExpanded((prevExpanded) => !prevExpanded),
                })}
              >
                {isExpanded ? '↑ Collapse' : '↓ Expand'}
              </TextButton>
            </>
          ) : (
            <Article className="my-6 sm:my-8">
              <h1>{grant?.name || '...'}</h1>
              <MarkdownViewer preview={!!previewGrant}>
                {grant?.introduction}
              </MarkdownViewer>
            </Article>
          )}
          <GrantInfo
            community={community || undefined}
            grant={grant}
            className="mb-6 block sm:hidden"
          />
          {previewGrant ? null : (
            <div className="my-6 flex items-center justify-between border-t border-gray-200 pt-6">
              {grant?.proposals ? (
                <h2 className="text-2xl font-bold">
                  {option === options[0]
                    ? grant.proposals === 1
                      ? '1 Proposal'
                      : `${grant.proposals} Proposals`
                    : grant.selectedProposals === 1
                    ? '1 Selected proposal'
                    : `${grant.selectedProposals} Selected proposals`}
                </h2>
              ) : (
                <h2 />
              )}
              <div className="flex items-center">
                {grant?.permission.selecting && grant?.proposals ? (
                  <Select
                    options={options}
                    value={option}
                    onChange={setOption}
                  />
                ) : null}
                <GrantProposalCreateButton
                  communityId={query.community_id}
                  grant={grant}
                  className="ml-5"
                />
              </div>
            </div>
          )}
          <ul className="mt-5 space-y-5">
            {grantProposals
              ?.filter(
                (grantProposal) =>
                  option === options[0] || grantProposal.selected,
              )
              .map((grantProposal) => (
                <li key={grantProposal.permalink}>
                  {query.community_id && grant ? (
                    <GrantProposalCard
                      communityId={query.community_id}
                      grantProposal={grantProposal}
                      phase={phase}
                    />
                  ) : null}
                </li>
              ))}
          </ul>
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
