import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import { useMemo } from 'react'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'

import useWorkgroup from '../../../hooks/use-workgroup'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'
import LoadingBar from '../../../components/basic/loading-bar'
import { appRouter } from '../../../server/routers/_app'
import useWallet from '../../../hooks/use-wallet'
import useDids from '../../../hooks/use-dids'
import Button from '../../../components/basic/button'

export const getServerSideProps: GetServerSideProps<{
  entry: string
  workgroup: string
}> = async (context) => {
  const entry = context.params!.entry as string
  const workgroup = context.params!.workgroup as string

  const ssg = createProxySSGHelpers({ router: appRouter, ctx: {} })
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
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(props.entry && dids?.includes(props.entry)),
    [dids, props.entry],
  )

  return (
    <CommunityLayout>
      <WorkgroupLayout>
        <LoadingBar loading={isLoading} />
        <Article className="pt-6">{workgroup?.extension?.about}</Article>
        {isAdmin && workgroup ? (
          <div className="mt-8">
            <Link href={`/${props.entry}/${workgroup.id}/settings`}>
              <Button icon={PencilIcon} primary>
                Edit
              </Button>
            </Link>
          </div>
        ) : null}
      </WorkgroupLayout>
    </CommunityLayout>
  )
}
