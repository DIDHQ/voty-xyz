import { useCallback } from 'react'
import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import TextButton from '../../components/basic/text-button'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const {
    data: community,
    isLoading,
    refetch,
  } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}`)
  }, [query.entry, refetch, router])

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton href={`/${query.entry}/about`} className="mt-6 sm:mt-8">
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        {community ? (
          <CommunityForm
            author={query.entry}
            initialValue={community}
            onSuccess={handleSuccess}
            className="flex w-full flex-col"
          />
        ) : null}
      </div>
    </>
  )
}
