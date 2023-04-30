import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../../hooks/use-router-query'
import TextButton from '../../../../components/basic/text-button'
import { trpc } from '../../../../utils/trpc'
import LoadingBar from '../../../../components/basic/loading-bar'
import GroupProposalForm from '../../../../components/group-proposal-form'
import { documentTitle } from '../../../../utils/constants'
import { GroupProposal } from '../../../../utils/schemas/group-proposal'

export default function CreateProposalPage() {
  const query = useRouterQuery<['community_id', 'group_id']>()
  const { data: group, isLoading } = trpc.group.getById.useQuery(
    { communityId: query.community_id, id: query.group_id },
    { enabled: !!query.community_id && !!query.group_id },
  )
  const initialValue = useMemo<Partial<GroupProposal>>(
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
          disabled={!query.community_id || !query.group_id}
          href={`/${query.community_id}/group/${query.group_id}`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
        {query.community_id && group ? (
          <GroupProposalForm
            initialValue={initialValue}
            communityId={query.community_id}
            group={group}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
