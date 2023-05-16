import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import TextButton from '../../components/basic/text-button'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['community_id']>()
  const { data: community, isLoading } = trpc.community.getById.useQuery(
    { id: query.community_id },
    { enabled: !!query.community_id },
  )

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          href={`/${query.community_id}/about`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
        {query.community_id && community !== undefined ? (
          <CommunityForm
            communityId={query.community_id}
            initialValue={community}
            preview={{
              from: router.asPath,
              to: `/${query.community_id}/about`,
              template: `You are updating community on Voty\n\nhash:\n{keccak256}`,
              author: query.community_id,
            }}
            className="flex w-full flex-col"
          />
        ) : null}
      </div>
    </>
  )
}
