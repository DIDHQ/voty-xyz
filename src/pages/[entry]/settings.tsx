import { useCallback } from 'react'
import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const {
    data: community,
    isLoading,
    refetch,
  } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}`)
  }, [query.entry, refetch, router])

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      <CommunityForm
        author={query.entry}
        initialValue={community || undefined}
        onSuccess={handleSuccess}
        className="flex w-full flex-col"
      />
    </CommunityLayout>
  )
}
