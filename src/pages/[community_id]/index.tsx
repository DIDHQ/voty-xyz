import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/20/solid'

import useRouterQuery from '../../hooks/use-router-query'
import GroupProposalCard from '../../components/group-proposal-card'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import Button from '../../components/basic/button'
import EmptyState from '../../components/empty-state'
import useIsManager from '../../hooks/use-is-manager'
import Select from '../../components/basic/select'
import { GroupProposalPhase } from '../../utils/phase'

export default function CommunityIndexPage() {
  const query = useRouterQuery<['community_id']>()
  const [phase, setPhase] = useState<GroupProposalPhase | 'All'>('All')
  const { data: community, isLoading } = trpc.community.getById.useQuery(
    { id: query.community_id },
    { enabled: !!query.community_id },
  )
  const { data: groups, isLoading: isGroupsLoading } =
    trpc.group.listByCommunityId.useQuery(
      { communityId: query.community_id },
      { enabled: !!query.community_id },
    )
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isProposalsLoading,
  } = trpc.groupProposal.list.useInfiniteQuery(
    {
      communityId: query.community_id,
      phase: phase === 'All' ? undefined : phase,
    },
    { enabled: !!query.community_id, getNextPageParam: ({ next }) => next },
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
  const isManager = useIsManager(query.community_id)
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

  return (
    <CommunityLayout>
      <LoadingBar
        loading={isLoading || isGroupsLoading || isProposalsLoading}
      />
      <div className="mt-6 flex justify-between sm:mt-8">
        <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
        <Select
          options={options}
          value={phase}
          onChange={(p) => setPhase(p as GroupProposalPhase | 'All')}
          className="-mt-1 sm:-mt-2"
        />
      </div>
      {groupProposals?.length === 0 ? (
        <EmptyState
          title="No events"
          className="mt-24"
          footer={
            community && !groups?.length && isManager ? (
              <Link href={`/${query.community_id}/create`}>
                <Button primary icon={PlusIcon}>
                  Workgroup
                </Button>
              </Link>
            ) : undefined
          }
        />
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
    </CommunityLayout>
  )
}
