import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../../hooks/use-router-query'
import TextLink from '../../../../components/basic/text-link'
import { trpc } from '../../../../utils/trpc'
import LoadingBar from '../../../../components/basic/loading-bar'
import GrantProposalForm from '../../../../components/grant-proposal-form'
import { documentTitle } from '../../../../utils/constants'
import { GrantProposal } from '../../../../utils/schemas/v1/grant-proposal'
import { permalink2Id } from '../../../../utils/permalink'

export default function CreateGrantProposalPage() {
  const query = useRouterQuery<['community_id', 'grant_permalink']>()
  const { data: grant, isLoading } = trpc.grant.getByPermalink.useQuery(
    { permalink: query.grant_permalink },
    { enabled: !!query.grant_permalink },
  )
  const initialValue = useMemo<Partial<GrantProposal>>(() => ({}), [])

  return (
    <>
      <Head>
        <title>{`New proposal - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextLink
          disabled={!query.community_id || !query.grant_permalink}
          href={`/${query.community_id}/grant/${
            query.grant_permalink ? permalink2Id(query.grant_permalink) : ''
          }`}
          className="mt-6 inline-block sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextLink>
        {query.community_id && query.grant_permalink && grant ? (
          <GrantProposalForm
            initialValue={initialValue}
            communityId={query.community_id}
            grant={grant}
            grantPermalink={query.grant_permalink}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
