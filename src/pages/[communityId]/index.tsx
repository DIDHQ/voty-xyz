import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { ArrowUpRightIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useQuery } from '@tanstack/react-query'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import Button from '../../components/basic/button'
import EmptyState from '../../components/empty-state'
import useIsManager from '../../hooks/use-is-manager'
import ActivityListItem from '../../components/activity-list-item'
import { hasEnabledSecondLevel } from '../../utils/sdks/dotbit/second-level'
import { isTestnet } from '../../utils/constants'
import Card from '@/src/components/basic/card'
import SectionHeader from '@/src/components/basic/section-header'
import { ActivitySkeleton } from '@/src/components/basic/skeleton'
import { formatDid } from '@/src/utils/did/utils'

export default function CommunityIndexPage() {
  const query = useRouterQuery<['communityId']>()
  const { data: groups, isLoading: isGroupsLoading } =
    trpc.group.listByCommunityId.useQuery(
      { communityId: query.communityId },
      { enabled: !!query.communityId },
    )
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isActivitiesLoading,
  } = trpc.activity.list.useInfiniteQuery(
    { communityId: query.communityId },
    { enabled: !!query.communityId, getNextPageParam: ({ next }) => next },
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
  const isManager = useIsManager(query.communityId)
  const { data: enabledSecondLevel } = useQuery(
    ['hasEnabledSecondLevel', query.communityId],
    () => hasEnabledSecondLevel(query.communityId!),
    { enabled: !!query.communityId && isManager },
  )

  return (
    <CommunityLayout loading={isGroupsLoading || isActivitiesLoading}>
      <SectionHeader title="Activities" />

      {enabledSecondLevel === false ? (
        <EmptyState
          icon={
            <ExclamationTriangleIcon className="h-9 w-9 rounded-lg bg-amber-100 p-1.5 text-amber-600" />
          }
          title="Last step"
          description="You must enable Second-Level DID for your community."
          footer={
            <Link
              href={`${
                isTestnet ? 'https://test.topdid.com/' : 'https://topdid.com/'
              }${query.communityId}`}
            >
              <Button primary icon={ArrowUpRightIcon}>
                Enable Second-Level DID
              </Button>
            </Link>
          }
        />
      ) : groups?.length === 0 && isManager && query.communityId ? (
        <EmptyState
          title="No workgroup"
          description="Workgroup helps you categorize proposals with different focuses. You can also set up workgroups to your community structure's needs."
          footer={
            <Link href={`/${formatDid(query.communityId)}/create`}>
              <Button primary icon={PlusIcon}>
                Workgroup
              </Button>
            </Link>
          }
        />
      ) : activities?.length === 0 ? (
        <EmptyState title="No activities" />
      ) : (
        <Card>
          {isGroupsLoading || isActivitiesLoading ? (
            [...Array(3)].map((item, index) => <ActivitySkeleton key={index} />)
          ) : (
            <ul>
              {activities?.map((activity) => (
                <li key={activity.ts + activity.actor}>
                  <ActivityListItem activity={activity} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
      <div ref={ref} />
    </CommunityLayout>
  )
}
