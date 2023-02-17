import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import { trpc } from '../../utils/trpc'
import useDids from '../../hooks/use-dids'

export default function CommunitySettingsPage() {
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
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}`)
  }, [refetch, query.entry, router])

  return (
    <CommunityLayout>
      {query.entry ? (
        <div className="flex w-full flex-col">
          <CommunityForm
            entry={query.entry}
            community={community}
            onSuccess={handleSuccess}
            disabled={!isAdmin}
            className="pl-6"
          />
        </div>
      ) : null}
    </CommunityLayout>
  )
}
