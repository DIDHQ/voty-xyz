import { useCallback } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import WorkgroupForm from '../../../components/workgroup-form'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import TextButton from '../../../components/basic/text-button'

export default function WorkgroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'workgroup']>()
  const {
    data: community,
    isLoading,
    refetch,
  } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const handleSuccess = useCallback(
    (isArchive: boolean) => {
      refetch()
      router.push(
        isArchive
          ? `/${query.entry}`
          : `/${query.entry}/${query.workgroup}/settings`,
      )
    },
    [query.entry, query.workgroup, refetch, router],
  )

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          href={`/${query.entry}/${query.workgroup}`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        <WorkgroupForm
          author={query.entry || ''}
          initialValue={community || undefined}
          workgroup={query.workgroup || ''}
          onSuccess={handleSuccess}
          className="pt-6 sm:pt-8"
        />
      </div>
    </>
  )
}
