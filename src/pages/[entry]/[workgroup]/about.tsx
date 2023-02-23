import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { createProxySSGHelpers } from '@trpc/react-query/ssg'

import useWorkgroup from '../../../hooks/use-workgroup'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'
import LoadingBar from '../../../components/basic/loading-bar'
import { appRouter } from '../../../server/routers/_app'

export const getServerSideProps: GetServerSideProps<{
  entry: string
  workgroup: string
}> = async (context) => {
  const ssg = createProxySSGHelpers({ router: appRouter, ctx: {} })
  const entry = context.params!.entry as string
  const workgroup = context.params!.workgroup as string
  await ssg.community.getByEntry.prefetch({ entry })
  return { props: { trpcState: ssg.dehydrate(), entry, workgroup } }
}

export default function WorkgroupAboutPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: props.entry },
    { enabled: !!props.entry, refetchOnWindowFocus: false },
  )
  const workgroup = useWorkgroup(community, props.workgroup)

  return (
    <CommunityLayout>
      <WorkgroupLayout>
        <LoadingBar loading={isLoading} />
        <Article className="pt-6 sm:pl-6">
          {workgroup?.extension?.about}
        </Article>
      </WorkgroupLayout>
    </CommunityLayout>
  )
}
