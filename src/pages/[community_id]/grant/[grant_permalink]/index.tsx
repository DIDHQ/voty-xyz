import { useMemo } from 'react'
import { compact } from 'lodash-es'
import Head from 'next/head'
import { useAtomValue } from 'jotai'
import SuperJSON from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { GetServerSidePropsContext } from 'next'

import { trpc } from '@/src/utils/trpc'
import LoadingBar from '@/src/components/basic/loading-bar'
import {
  documentDescription,
  documentImage,
  documentTitle,
  previewPermalink,
} from '@/src/utils/constants'
import useRouterQuery from '@/src/hooks/use-router-query'
import { previewGrantAtom } from '@/src/utils/atoms'
import { Grant } from '@/src/utils/schemas/v1/grant'
import {
  id2Permalink,
  isPermalink,
  permalink2Gateway,
} from '@/src/utils/permalink'
import { getImages, getSummary } from '@/src/utils/markdown'
import { appRouter } from '@/src/server/routers/_app'

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
  return { props: {} }
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
    </>
  )
}
