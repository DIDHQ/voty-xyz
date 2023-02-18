import { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'

import useRouterQuery from '../../hooks/use-router-query'
import WorkgroupForm from '../../components/workgroup-form'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import { trpc } from '../../utils/trpc'
import useDids from '../../hooks/use-dids'

export default function CreateWorkgroupPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const { data: community, refetch } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(query.entry && dids?.includes(query.entry)),
    [dids, query.entry],
  )
  const workgroup = useMemo(() => nanoid(), [])
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}/${workgroup}`)
  }, [refetch, router, query.entry, workgroup])

  return (
    <CommunityLayout>
      {query.entry && community ? (
        <WorkgroupForm
          community={community}
          workgroup={workgroup}
          onSuccess={handleSuccess}
          disabled={!isAdmin}
          className="sm:pl-6"
        />
      ) : null}
    </CommunityLayout>
  )
}
