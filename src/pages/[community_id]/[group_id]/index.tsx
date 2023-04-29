import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import useRouterQuery from '../../../hooks/use-router-query'
import GroupProposalCard from '../../../components/group-proposal-card'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import EmptyState from '../../../components/empty-state'
import GroupProposalCreateButton from '../../../components/group-proposal-create-button'
import Select from '../../../components/basic/select'
import { GroupProposalPhase } from '../../../utils/phase'
import useIsManager from '../../../hooks/use-is-manager'

export default function GroupIndexPage() {
  const query = useRouterQuery<['community_id', 'group_id']>()
  const [phase, setPhase] = useState<GroupProposalPhase | 'All'>('All')
  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.groupProposal.list.useInfiniteQuery(
      {
        communityId: query.community_id,
        groupId: query.group_id,
        phase: phase === 'All' ? undefined : phase,
      },
      {
        enabled: !!query.community_id && !!query.group_id,
        getNextPageParam: ({ next }) => next,
      },
    )
  const { data: group } = trpc.group.getById.useQuery(
    { communityId: query.community_id, id: query.group_id },
    { enabled: !!query.community_id && !!query.group_id },
  )
  const groupProposals = useMemo(
    () => data?.pages.flatMap(({ data }) => data),
    [data],
  )
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])
  const options = useMemo(
    () => [
      'All',
      GroupProposalPhase.CONFIRMING,
      GroupProposalPhase.ANNOUNCING,
      GroupProposalPhase.VOTING,
      GroupProposalPhase.ENDED,
    ],
    [],
  )
  const isManager = useIsManager(query.community_id)

  return (
    <CommunityLayout>
      <GroupLayout>
        <LoadingBar loading={isLoading} />
        <div className="my-5 flex justify-between">
          <Select
            options={options}
            value={phase}
            onChange={(p) => setPhase(p as GroupProposalPhase | 'All')}
          />
          {isManager ? (
            <GroupProposalCreateButton
              communityId={query.community_id}
              group={group || undefined}
            />
          ) : null}
        </div>
        {groupProposals?.length === 0 ? (
          <EmptyState title="No proposals" className="mt-24" />
        ) : (
          <ul role="list" className="mt-5 space-y-5">
            {groupProposals?.map((groupProposal) => (
              <li key={groupProposal.permalink}>
                <GroupProposalCard groupProposal={groupProposal} />
              </li>
            ))}
          </ul>
        )}
        <div ref={ref} />
      </GroupLayout>
    </CommunityLayout>
  )
}
