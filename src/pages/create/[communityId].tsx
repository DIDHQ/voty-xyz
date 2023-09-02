import { useRouter } from 'next/router'
import Head from 'next/head'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import { documentTitle } from '../../utils/constants'
import { Container } from '@/src/components/basic/container'
import { BackBar } from '@/src/components/basic/back'

export default function CreateEntryPage() {
  const router = useRouter()
  const query = useRouterQuery<['communityId']>()

  return (
    <>
      <Head>
        <title>{`New community - ${documentTitle}`}</title>
      </Head>

      <Container size="small">
        <BackBar href="/create" />

        {query.communityId ? (
          <CommunityForm
            communityId={query.communityId}
            initialValue={null}
            preview={{
              from: router.asPath,
              to: `/${query.communityId}/about?preview=true`,
              template: `You are creating community on Voty\n\nhash:\n{keccak256}`,
              author: query.communityId,
            }}
          />
        ) : null}
      </Container>
    </>
  )
}
