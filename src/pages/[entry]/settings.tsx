import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import TextButton from '../../components/basic/text-button'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton href={`/${query.entry}/about`} className="mt-6 sm:mt-8">
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
        {query.entry && community !== undefined ? (
          <CommunityForm
            author={query.entry}
            initialValue={community}
            preview={{
              from: router.asPath,
              to: `/${query.entry}/about`,
              template: `You are updating community on Voty\n\nhash:\n{sha256}`,
              author: query.entry,
            }}
            className="flex w-full flex-col"
          />
        ) : null}
      </div>
    </>
  )
}
