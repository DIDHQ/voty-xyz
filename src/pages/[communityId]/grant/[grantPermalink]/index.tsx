import { useEffect, useMemo, useState } from 'react'
import { compact, last } from 'remeda'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { useCollapse } from 'react-collapsed'
import { SuperJSON } from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { GetServerSideProps } from 'next'

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
import { previewGrantAtom } from '@/src/utils/atoms'
import { Grant } from '@/src/utils/schemas/v1/grant'
import GrantProposalCard from '@/src/components/grant-proposal-card'
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
import { getImage, getSummary } from '@/src/utils/markdown'
import MarkdownViewer from '@/src/components/basic/markdown-viewer'
import GrantInfo from '@/src/components/grant-info'
import GrantProposalCreateButton from '@/src/components/grant-proposal-create-button'
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
    await helpers.grant.getByPermalink.prefetch({
      permalink: id2Permalink(id),
    })
  }
  context.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  return { props: {} }
}

export default function GrantPage() {
  const query = useRouterQuery<['communityId', 'grantPermalink']>()
  const previewGrant = useAtomValue(previewGrantAtom)
  const { data, isLoading } = trpc.grant.getByPermalink.useQuery(
    { permalink: query.grantPermalink },
    { enabled: !!query.grantPermalink },
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
    return query.grantPermalink && data
      ? { ...data, permalink: query.grantPermalink }
      : undefined
  }, [data, previewGrant, query.grantPermalink])
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: grant?.community },
      { enabled: !!grant?.community, refetchOnWindowFocus: false },
    )
  const { account } = useWallet()
  const { data: grantProposals } = trpc.grantProposal.list.useQuery(
    { grantPermalink: query.grantPermalink, viewer: account?.address },
    { enabled: !!query.grantPermalink },
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
    const image = getImage(grant?.introduction)
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
                  communityId={query.communityId}
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
                  {query.communityId && grant ? (
                    <GrantProposalCard
                      communityId={query.communityId}
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
