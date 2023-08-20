import { useCallback } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../../hooks/use-router-query'
import GroupForm from '../../../../components/group-form'
import { trpc } from '../../../../utils/trpc'
import LoadingBar from '../../../../components/basic/loading-bar'
import { Container } from '@/src/components/basic/container'
import { BackBar } from '@/src/components/basic/back'

export default function GroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['communityId', 'groupId']>()
  const {
    data: group,
    isLoading,
    refetch,
  } = trpc.group.getById.useQuery(
    { communityId: query.communityId, id: query.groupId },
    { enabled: !!query.communityId && !!query.groupId },
  )
  const handleArchive = useCallback(() => {
    refetch()
    if (query.communityId) {
      router.push(`/${query.communityId}`)
    }
  }, [query.communityId, refetch, router])

  return (
    <>
      <LoadingBar 
        loading={isLoading} />
        
      <Container
        size="small">
        <BackBar
          href={`/${query.communityId}/group/${query.groupId}/about`} />
        
        {query.communityId && query.groupId && group !== undefined ? (
          <GroupForm
            communityId={query.communityId}
            initialValue={group}
            onArchive={handleArchive}
            preview={{
              from: `/${query.communityId}/group/${query.groupId}/settings`,
              to: `/${query.communityId}/group/${query.groupId}/about`,
              template: `You are updating workgroup on Voty\n\nhash:\n{keccak256}`,
              author: query.communityId,
            }}/>
        ) : null}
      </Container>
    </>
  )
}
