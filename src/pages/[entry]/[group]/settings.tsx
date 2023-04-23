import { useCallback } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import WorkgroupForm from '../../../components/workgroup-form'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import TextButton from '../../../components/basic/text-button'

export default function GroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'group']>()
  const {
    data: group,
    isLoading,
    refetch,
  } = trpc.group.getById.useQuery(
    { community_id: query.entry, id: query.group },
    { enabled: !!query.entry && !!query.group },
  )
  const handleArchive = useCallback(() => {
    refetch()
    if (query.entry) {
      router.push(`/${query.entry}`)
    }
  }, [query.entry, refetch, router])

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          href={`/${query.entry}/${query.group}/about`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
        {query.entry && query.group && group !== undefined ? (
          <WorkgroupForm
            author={query.entry}
            initialValue={group}
            onArchive={handleArchive}
            preview={{
              from: `/${query.entry}/${query.group}/settings`,
              to: `/${query.entry}/${query.group}/about`,
              template: `You are updating workgroup on Voty\n\nhash:\n{sha256}`,
              author: query.entry,
            }}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
