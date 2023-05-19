import { useCallback } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../../hooks/use-router-query'
import GroupForm from '../../../../components/group-form'
import { trpc } from '../../../../utils/trpc'
import LoadingBar from '../../../../components/basic/loading-bar'
import TextLink from '../../../../components/basic/text-link'

export default function GroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['community_id', 'group_id']>()
  const {
    data: group,
    isLoading,
    refetch,
  } = trpc.group.getById.useQuery(
    { communityId: query.community_id, id: query.group_id },
    { enabled: !!query.community_id && !!query.group_id },
  )
  const handleArchive = useCallback(() => {
    refetch()
    if (query.community_id) {
      router.push(`/${query.community_id}`)
    }
  }, [query.community_id, refetch, router])

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextLink
          href={`/${query.community_id}/group/${query.group_id}/about`}
          className="mt-6 inline-block sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextLink>
        {query.community_id && query.group_id && group !== undefined ? (
          <GroupForm
            communityId={query.community_id}
            initialValue={group}
            onArchive={handleArchive}
            preview={{
              from: `/${query.community_id}/group/${query.group_id}/settings`,
              to: `/${query.community_id}/group/${query.group_id}/about`,
              template: `You are updating workgroup on Voty\n\nhash:\n{keccak256}`,
              author: query.community_id,
            }}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
