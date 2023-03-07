import { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'
import Head from 'next/head'

import useRouterQuery from '../../hooks/use-router-query'
import WorkgroupForm from '../../components/workgroup-form'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import { trpc } from '../../utils/trpc'
import useDids from '../../hooks/use-dids'
import LoadingBar from '../../components/basic/loading-bar'
import { documentTitle } from '../../utils/constants'

export default function CreateWorkgroupPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const {
    data: community,
    isLoading,
    refetch,
  } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(query.entry && dids?.includes(query.entry)),
    [dids, query.entry],
  )
  const newWorkgroup = useMemo(() => nanoid(), [])
  const handleSuccess = useCallback(
    (workgroup?: string) => {
      refetch()
      if (workgroup) {
        router.push(`/${query.entry}/${workgroup}`)
      } else {
        router.push(`/${query.entry}`)
      }
    },
    [refetch, router, query.entry],
  )

  return (
    <CommunityLayout>
      <Head>
        <title>{`New workgroup - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      {community ? (
        <WorkgroupForm
          community={community}
          workgroup={newWorkgroup}
          onSuccess={handleSuccess}
          disabled={!isAdmin}
          className="pt-6 sm:pt-8"
        />
      ) : null}
    </CommunityLayout>
  )
}
