import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { createProxySSGHelpers } from '@trpc/react-query/ssg'

import CommunityLayout from '../../components/layouts/community'
import Article from '../../components/basic/article'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import { appRouter } from '../../server/routers/_app'

export const getServerSideProps: GetServerSideProps<{ entry: string }> = async (
  context,
) => {
  const entry = context.params!.entry as string

  const ssg = createProxySSGHelpers({ router: appRouter, ctx: {} })
  await ssg.community.getByEntry.prefetch({ entry })

  return { props: { trpcState: ssg.dehydrate(), entry } }
}

export default function CommunityAboutPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: props.entry },
    { enabled: !!props.entry, refetchOnWindowFocus: false },
  )

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      <h3 className="mt-6 text-lg font-medium leading-6 text-gray-900">
        About
      </h3>
      <Article className="w-full pt-6">{community?.extension?.about}</Article>
    </CommunityLayout>
  )
}
