import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import TextLink from '../../components/basic/text-link'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['communityId']>()
  const { data: community, isLoading } = trpc.community.getById.useQuery(
    { id: query.communityId },
    { enabled: !!query.communityId },
  )

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextLink
          href={`/${query.communityId}/about`}
          className="mt-6 inline-block sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextLink>
        {query.communityId && community !== undefined ? (
          <CommunityForm
            communityId={query.communityId}
            initialValue={community}
            preview={{
              from: router.asPath,
              to: `/${query.communityId}/about`,
              template: `You are updating community on Voty\n\nhash:\n{keccak256}`,
              author: query.communityId,
            }}
            className="flex w-full flex-col"
          />
        ) : null}
      </div>
    </>
  )
}
