import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import { Container } from '@/src/components/basic/container'
import { BackBar } from '@/src/components/basic/back'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['communityId']>()
  const { data: community, isLoading } = trpc.community.getById.useQuery(
    { id: query.communityId },
    { enabled: !!query.communityId },
  )

  return (
    <>
      <LoadingBar 
        loading={isLoading} />
        
      <Container
        size="small">
        <BackBar
          href={`/${query.communityId}/about`} />
        
        {query.communityId && community !== undefined ? (
          <CommunityForm
            communityId={query.communityId}
            initialValue={community}
            preview={{
              from: router.asPath,
              to: `/${query.communityId}/about?preview=true`,
              template: `You are updating community on Voty\n\nhash:\n{keccak256}`,
              author: query.communityId,
            }}
            className="flex w-full flex-col"
          />
        ) : null}
      </Container>
    </>
  )
}
