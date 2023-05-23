import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { ArrowUpRightIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useQuery } from '@tanstack/react-query'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import Button from '../../components/basic/button'
import EmptyState from '../../components/empty-state'
import useIsManager from '../../hooks/use-is-manager'
import ActivityListItem from '../../components/activity-list-item'
import { hasEnabledSubDID } from '../../utils/sdks/dotbit/subdid'
import { subDIDWebsite } from '../../utils/constants'

export default function CommunityIndexPage() {
  const query = useRouterQuery<['community_id']>()
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
  const { data: enabledSubDID } = useQuery(
    ['hasEnabledSubDID', query.community_id],
    () => hasEnabledSubDID(query.community_id!),
    { enabled: !!query.community_id && isManager },
  )

  return (
    <CommunityLayout>
      <LoadingBar loading={isGroupsLoading || isActivitiesLoading} />
      <div className="mt-6 flex items-center justify-between sm:mt-8">
        {enabledSubDID === false ? (
          <div className="h-[38px]" />
        ) : (
          <h3 className="text-lg font-medium text-gray-900">Activities</h3>
        )}
      </div>
      {enabledSubDID === false ? (
        <EmptyState
          icon={
            <ExclamationTriangleIcon className="h-9 w-9 rounded-lg bg-amber-100 p-1.5 text-amber-600" />
          }
          title="Last step"
          className="mt-24"
          description="You must enable SubDID for your community."
          footer={
            <Link href={`${subDIDWebsite}${query.community_id}`}>
              <Button primary icon={ArrowUpRightIcon}>
                Enable SubDID
              </Button>
            </Link>
          }
        />
      ) : groups?.length === 0 && isManager ? (
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
