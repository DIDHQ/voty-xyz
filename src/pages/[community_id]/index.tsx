import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/20/solid'

import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import Button from '../../components/basic/button'
import EmptyState from '../../components/empty-state'
import useIsManager from '../../hooks/use-is-manager'
import Select from '../../components/basic/select'
import { GroupProposalPhase } from '../../utils/phase'
import ActivityListItem from '../../components/activity-list-item'

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
    isLoading: isActivitiesLoading,
  } = trpc.activity.list.useInfiniteQuery(
    { communityId: query.community_id },
    { enabled: !!query.community_id, getNextPageParam: ({ next }) => next },
  )
  const activities = useMemo(
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
      GroupProposalPhase.ANNOUNCING,
      GroupProposalPhase.VOTING,
      GroupProposalPhase.ENDED,
    ],
    [],
  )

  return (
    <CommunityLayout>
      <LoadingBar
        loading={isLoading || isGroupsLoading || isActivitiesLoading}
      />
      <div className="mt-6 flex items-center justify-between sm:mt-8">
        <h3 className="text-lg font-medium text-gray-900">Activities</h3>
        <Select
          options={options}
          value={phase}
          onChange={(p) => setPhase(p as GroupProposalPhase | 'All')}
        />
      </div>
      {groups?.length === 0 && isManager ? (
        <EmptyState
          title="No workgroup"
          className="mt-24"
          description="Workgroup helps you categorize proposals with different focuses. You can also set up workgroups to your community structure's needs."
          footer={
            <Link href={`/${query.community_id}/create`}>
              <Button primary icon={PlusIcon}>
                Workgroup
              </Button>
            </Link>
          }
        />
      ) : activities?.length === 0 ? (
        <EmptyState title="No activities" className="mt-24" />
      ) : (
        <ul className="mt-5 space-y-5">
          {activities?.map((activity) => (
            <li key={activity.ts + activity.actor}>
              <ActivityListItem activity={activity} />
            </li>
          ))}
        </ul>
      )}
      <div ref={ref} />
    </CommunityLayout>
  )
}
