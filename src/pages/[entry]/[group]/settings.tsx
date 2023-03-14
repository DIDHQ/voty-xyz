import { useCallback } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import GroupForm from '../../../components/group-form'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import TextButton from '../../../components/basic/text-button'

export default function GroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'group']>()
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
          ? `/${query.entry}/about`
          : `/${query.entry}/${query.group}/rules`,
      )
    },
    [query.entry, query.group, refetch, router],
  )

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          href={`/${query.entry}/${query.group}/rules`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        <GroupForm
          author={query.entry || ''}
          initialValue={community || undefined}
          group={query.group || ''}
          onSuccess={handleSuccess}
          className="pt-6 sm:pt-8"
        />
      </div>
    </>
  )
}
