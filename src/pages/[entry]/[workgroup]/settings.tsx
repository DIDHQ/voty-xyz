import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import WorkgroupForm from '../../../components/workgroup-form'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import useWallet from '../../../hooks/use-wallet'
import { trpc } from '../../../utils/trpc'
import useDids from '../../../hooks/use-dids'
import LoadingBar from '../../../components/basic/loading-bar'

export default function WorkgroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'workgroup']>()
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
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}/${query.workgroup}`)
  }, [refetch, query.entry, query.workgroup, router])

  return (
    <CommunityLayout>
      <WorkgroupLayout>
        <LoadingBar loading={isLoading} />
        {query.entry && query.workgroup && community ? (
          <WorkgroupForm
            community={community}
            workgroup={query.workgroup}
            onSuccess={handleSuccess}
            disabled={!isAdmin}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </WorkgroupLayout>
    </CommunityLayout>
  )
}
