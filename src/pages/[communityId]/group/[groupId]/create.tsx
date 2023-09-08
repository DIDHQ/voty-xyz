import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../../hooks/use-router-query'
import { trpc } from '../../../../utils/trpc'
import LoadingBar from '../../../../components/basic/loading-bar'
import GroupProposalForm from '../../../../components/group-proposal-form'
import { documentTitle } from '../../../../utils/constants'
import { GroupProposal } from '../../../../utils/schemas/v1/group-proposal'
import { Container } from '@/src/components/basic/container'
import { BackBar } from '@/src/components/basic/back'
import { formatDid } from '@/src/utils/did/utils'

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

      <Container size="small">
        <BackBar
          disabled={!query.communityId || !query.groupId}
          href={
            query.communityId
              ? `/${formatDid(query.communityId)}/group/${query.groupId}`
              : '#'
          }
        />

        {query.communityId && group ? (
          <GroupProposalForm
            initialValue={initialValue}
            communityId={query.communityId}
            group={group}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </Container>
    </>
  )
}
