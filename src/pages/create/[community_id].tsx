import { useRouter } from 'next/router'
import Head from 'next/head'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import TextButton from '../../components/basic/text-button'
import { documentTitle } from '../../utils/constants'

export default function CreateEntryPage() {
  const router = useRouter()
  const query = useRouterQuery<['community_id']>()

  return (
    <>
      <Head>
        <title>{`New community - ${documentTitle}`}</title>
      </Head>
      <div className="w-full">
        <TextButton href="/create" className="mt-6 sm:mt-8">
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
        {query.community_id ? (
          <CommunityForm
            communityId={query.community_id}
            initialValue={null}
            preview={{
              from: router.asPath,
              to: `/${query.community_id}/about`,
              template: `You are creating community on Voty\n\nhash:\n{sha256}`,
              author: query.community_id,
            }}
            className="flex w-full flex-col"
          />
        ) : null}
      </div>
    </>
  )
}
