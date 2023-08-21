import { useEffect, useMemo, useState } from 'react'
import { compact, last } from 'remeda'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import { useCollapse } from 'react-collapsed'
import { SuperJSON } from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { GetServerSideProps } from 'next'

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { trpc } from '@/src/utils/trpc'
import Article from '@/src/components/basic/article'
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
import { parseImage, parseRoot, parseContent } from '@/src/utils/markdown'
import MarkdownViewer from '@/src/components/basic/markdown-viewer'
import GrantInfo from '@/src/components/grant-info'
import GrantProposalCreateButton from '@/src/components/grant-proposal-create-button'
import { appRouter } from '@/src/server/routers/_app'
import { Container, Main, Sidebar } from '@/src/components/basic/container'
import Card from '@/src/components/basic/card'
import SectionHeader from '@/src/components/basic/section-header'
import { BackBar } from '@/src/components/basic/back'
import { ArticleSkeleton, SidebarInfoSkeleton } from '@/src/components/basic/skeleton'

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
  const root = useMemo(
    () => parseRoot(grant?.introduction),
    [grant?.introduction],
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
      
      <LoadingBar 
        loading={isLoading || isCommunityLoading} />
        
      <Container
        hasSidebar>
        <Main>
          <BackBar
            disabled={!community || !!previewGrant}
            href={`/${community?.id}/grant`} />
          
          {isLoading || isCommunityLoading ? (
            <ArticleSkeleton />
          ) : (
            grant && grant?.introduction.split('\n').length >= 4 ? (
              <Card
                size="medium">
                <section 
                  {...getCollapseProps()}>
                  <Article >
                    <h1>
                      {grant?.name || '...'}
                    </h1>
                    
                    <MarkdownViewer 
                      preview={!!previewGrant}>
                      {grant?.introduction}
                    </MarkdownViewer>
                  </Article>
                </section>
                
                <TextButton
                  className="mt-6 gap-1"
                  primary
                  {...getToggleProps({
                    onClick: () => setExpanded((prevExpanded) => !prevExpanded),
                  })}>
                  {isExpanded ? (
                    <>
                      <ChevronUpIcon 
                        className="h-4 w-4 stroke-2" />
                    
                      <span>
                        Collapse
                      </span>
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon
                        className="h-4 w-4 stroke-2" />
                    
                      <span>
                        Expand
                      </span>
                    </>
                  )}
                </TextButton>
              </Card>
            ) : (
              <Card
                size="medium">
                <Article>
                  <h1>
                    {grant?.name || '...'}
                  </h1>
                  
                  <MarkdownViewer 
                    preview={!!previewGrant}>
                    {grant?.introduction}
                  </MarkdownViewer>
                </Article>
              </Card>
            )
          )}
          
          <GrantInfo
            community={community || undefined}
            grant={grant}
            className="block sm:hidden" />
            
          {previewGrant ? null : (
            <SectionHeader
              title={grant?.proposals ? (option === options[0]
                    ? grant.proposals === 1
                      ? '1 Proposal'
                      : `${grant.proposals} Proposals`
                    : grant.selectedProposals === 1
                    ? '1 Selected proposal'
                    : `${grant.selectedProposals} Selected proposals`) : ''}>
              
              <div 
                className="flex items-center">
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
                  className="ml-4"/>
              </div>
            </SectionHeader>
          )}
          
          <ul 
            className="space-y-4 md:space-y-6">
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
        </Main>
        
        <Sidebar
          className="hidden sm:block">
          {(isLoading || isCommunityLoading) ? (
            <SidebarInfoSkeleton />
          ) : (
            <GrantInfo
              community={community || undefined}
              grant={grant} />
          )}
        </Sidebar>
      </Container>
    </>
  )
}
