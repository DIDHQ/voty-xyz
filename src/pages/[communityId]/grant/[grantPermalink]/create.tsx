import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../../hooks/use-router-query'
import { trpc } from '../../../../utils/trpc'
import LoadingBar from '../../../../components/basic/loading-bar'
import GrantProposalForm from '../../../../components/grant-proposal-form'
import { documentTitle } from '../../../../utils/constants'
import { GrantProposal } from '../../../../utils/schemas/v1/grant-proposal'
import { permalink2Id } from '../../../../utils/permalink'
import { BackBar } from '@/src/components/basic/back'
import { Container } from '@/src/components/basic/container'

export default function CreateGrantProposalPage() {
  const query = useRouterQuery<['communityId', 'grantPermalink']>()
  const { data: grant, isLoading } = trpc.grant.getByPermalink.useQuery(
    { permalink: query.grantPermalink },
    { enabled: !!query.grantPermalink },
  )
  const initialValue = useMemo<Partial<GrantProposal>>(() => ({}), [])

  return (
    <>
      <Head>
        <title>{`New proposal - ${documentTitle}`}</title>
      </Head>
      
      <LoadingBar loading={isLoading} />
      
      <Container
        size="small">
        <BackBar
          disabled={!query.communityId || !query.grantPermalink}
          href={`/${query.communityId}/grant/${
            query.grantPermalink ? permalink2Id(query.grantPermalink) : ''
          }`} />
          
        {query.communityId && query.grantPermalink && grant ? (
          <GrantProposalForm
            initialValue={initialValue}
            communityId={query.communityId}
            grant={grant}
            grantPermalink={query.grantPermalink} />
        ) : null}
      </Container>
    </>
  )
}
