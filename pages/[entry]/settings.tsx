import { useCallback } from 'react'
import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import { useCommunity } from '../../hooks/use-api'
import CommunityLayout from '../../components/layouts/community'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const [query] = useRouterQuery<['entry']>()
  const { data: community } = useCommunity(query.entry)
  const handleSuccess = useCallback(() => {
    router.push(`/${query.entry}`)
  }, [query.entry, router])

  return (
    <CommunityLayout>
      {query.entry ? (
        <div className="flex w-full flex-col">
          <CommunityForm
            entry={query.entry}
            community={community}
            onSuccess={handleSuccess}
            className="pl-6"
          />
        </div>
      ) : null}
    </CommunityLayout>
  )
}
