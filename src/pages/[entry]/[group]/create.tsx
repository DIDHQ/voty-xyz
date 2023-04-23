import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import useGroup from '../../../hooks/use-group'
import TextButton from '../../../components/basic/text-button'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import ProposalForm from '../../../components/proposal-form'
import { documentTitle } from '../../../utils/constants'
import { Proposal } from '../../../utils/schemas/proposal'

export default function CreateProposalPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community, isLoading } = trpc.community.getById.useQuery(
    { id: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group)
  const initialValue = useMemo<Partial<Proposal>>(
    () => ({ voting_type: 'single', options: ['', ''] }),
    [],
  )

  return (
    <>
      <Head>
        <title>{`New proposal - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          disabled={!query.entry || !query.group}
          href={`/${query.entry}/${query.group}`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
        {community && group ? (
          <ProposalForm
            initialValue={initialValue}
            community={community}
            group={group}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
