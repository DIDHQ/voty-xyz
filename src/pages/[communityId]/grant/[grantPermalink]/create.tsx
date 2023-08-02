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
      <div className="w-full">
        <TextLink
          disabled={!query.communityId || !query.grantPermalink}
          href={`/${query.communityId}/grant/${
            query.grantPermalink ? permalink2Id(query.grantPermalink) : ''
          }`}
          className="mt-6 inline-block sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextLink>
        {query.communityId && query.grantPermalink && grant ? (
          <GrantProposalForm
            initialValue={initialValue}
            communityId={query.communityId}
            grant={grant}
            grantPermalink={query.grantPermalink}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
