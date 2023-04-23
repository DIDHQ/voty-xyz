import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import TextButton from '../../../components/basic/text-button'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import ProposalForm from '../../../components/proposal-form'
import { documentTitle } from '../../../utils/constants'
import { Proposal } from '../../../utils/schemas/proposal'

export default function CreateProposalPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const { data: group, isLoading } = trpc.group.getById.useQuery(
    { community_id: query.entry, id: query.group },
    { enabled: !!query.entry && !!query.group },
  )
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
        {query.entry && group ? (
          <ProposalForm
            initialValue={initialValue}
            community={query.entry}
            group={group}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
