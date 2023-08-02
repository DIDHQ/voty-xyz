import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../../hooks/use-router-query'
import TextLink from '../../../../components/basic/text-link'
import { trpc } from '../../../../utils/trpc'
import LoadingBar from '../../../../components/basic/loading-bar'
import GroupProposalForm from '../../../../components/group-proposal-form'
import { documentTitle } from '../../../../utils/constants'
import { GroupProposal } from '../../../../utils/schemas/v1/group-proposal'

export default function CreateGroupProposalPage() {
  const query = useRouterQuery<['communityId', 'groupId']>()
  const { data: group, isLoading } = trpc.group.getById.useQuery(
    { communityId: query.communityId, id: query.groupId },
    { enabled: !!query.communityId && !!query.groupId },
  )
  const initialValue = useMemo<Partial<GroupProposal>>(
    () => ({ voting_type: 'single', choices: ['', ''] }),
    [],
  )

  return (
    <>
      <Head>
        <title>{`New proposal - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextLink
          disabled={!query.communityId || !query.groupId}
          href={`/${query.communityId}/group/${query.groupId}`}
          className="mt-6 inline-block sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextLink>
        {query.communityId && group ? (
          <GroupProposalForm
            initialValue={initialValue}
            communityId={query.communityId}
            group={group}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
