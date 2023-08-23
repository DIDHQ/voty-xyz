import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import useRouterQuery from '../../../../hooks/use-router-query'
import GroupProposalCard from '../../../../components/group-proposal-card'
import CommunityLayout from '../../../../components/layouts/community'
import GroupLayout from '../../../../components/layouts/group'
import { trpc } from '../../../../utils/trpc'
import EmptyState from '../../../../components/empty-state'
import GroupProposalCreateButton from '../../../../components/group-proposal-create-button'
import Select from '../../../../components/basic/select'
import { GroupProposalPhase } from '../../../../utils/phase'
import { InfoCardSkeleton } from '@/src/components/basic/skeleton'

export default function GroupIndexPage() {
  const query = useRouterQuery<['communityId', 'groupId']>()
  const [phase, setPhase] = useState<GroupProposalPhase | 'All'>('All')
  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.groupProposal.list.useInfiniteQuery(
      {
        communityId: query.communityId,
        groupId: query.groupId,
        phase: phase === 'All' ? undefined : phase,
      },
      {
        enabled: !!query.communityId && !!query.groupId,
        getNextPageParam: ({ next }) => next,
      },
    )
  const { data: group } = trpc.group.getById.useQuery(
    { communityId: query.communityId, id: query.groupId },
    { enabled: !!query.communityId && !!query.groupId },
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
      GroupProposalPhase.ANNOUNCING,
      GroupProposalPhase.VOTING,
      GroupProposalPhase.ENDED,
    ],
    [],
  )

  return (
    <CommunityLayout
      loading={isLoading}>
      <GroupLayout>
        <div 
          className="my-5 flex justify-between">
          <Select
            options={options}
            value={phase}
            onChange={(p) => setPhase(p as GroupProposalPhase | 'All')}/>
            
          <GroupProposalCreateButton
            communityId={query.communityId}
            group={group || undefined}/>
        </div>
        
        {groupProposals?.length === 0 ? (
          <EmptyState 
            title="No proposals" />
        ) : (
          !isLoading ? (
            <ul 
              className="space-y-4 md:space-y-6">
              {groupProposals?.map((groupProposal) => (
                <li 
                  key={groupProposal.permalink}>
                  <GroupProposalCard 
                    groupProposal={groupProposal} />
                </li>
              ))}
            </ul>
          ) : (
            <InfoCardSkeleton />
          )
        )}
        <div ref={ref} />
      </GroupLayout>
    </CommunityLayout>
  )
}
