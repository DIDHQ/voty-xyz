import {
  UserGroupIcon,
  BriefcaseIcon,
  TrophyIcon,
  BoltIcon,
  HandRaisedIcon,
} from '@heroicons/react/20/solid'
import { useCallback, useMemo } from 'react'
import { last } from 'lodash-es'

import { Activity } from '../utils/schemas/activity'
import { formatDurationMs } from '../utils/time'
import TextButton from './basic/text-button'
import useNow from '../hooks/use-now'

import { permalink2Id } from '../utils/permalink'

export default function ActivityListItem(props: {
  activity: { data: Activity; ts: Date; actor: string }
}) {
  const { activity } = props
  const now = useNow()
  const renderAction = useCallback(() => {
    switch (activity.data.type) {
      case 'create_community': {
        return (
          <>
            imported community&nbsp;
            <TextButton
              href={`/${activity.data.community_id}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.community_name}
            </TextButton>
          </>
        )
      }
      case 'update_community': {
        return (
          <>
            updated community&nbsp;
            <TextButton
              href={`/${activity.data.community_id}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.community_name}
            </TextButton>
          </>
        )
      }
      case 'create_grant': {
        return (
          <>
            created grant&nbsp;
            <TextButton
              href={`/${activity.data.community_id}/grant/${permalink2Id(
                activity.data.grant_permalink,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.grant_name}
            </TextButton>
          </>
        )
      }
      case 'create_group': {
        return (
          <>
            created group&nbsp;
            <TextButton
              href={`/${activity.data.community_id}/group/${permalink2Id(
                activity.data.group_id,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.group_name}
            </TextButton>
          </>
        )
      }
      case 'update_group': {
        return (
          <>
            updated group&nbsp;
            <TextButton
              href={`/${activity.data.community_id}/group/${permalink2Id(
                activity.data.group_id,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.group_name}
            </TextButton>
          </>
        )
      }
      case 'delete_group': {
        return (
          <>
            archived group&nbsp;
            <span className="font-medium text-gray-900">
              {activity.data.group_name}
            </span>
          </>
        )
      }
      default: {
        return 'did something'
      }
    }
  }, [activity.data])
  const icon = useMemo(
    () =>
      ({
        community: <UserGroupIcon className="h-5 w-5 text-gray-500" />,
        group: <BriefcaseIcon className="h-5 w-5 text-gray-500" />,
        grant: <TrophyIcon className="h-5 w-5 text-gray-500" />,
        proposal: <HandRaisedIcon className="h-5 w-5 text-gray-500" />,
        vote: <BoltIcon className="h-5 w-5 text-gray-500" />,
      }[last(activity.data.type.split('_'))!]),
    [activity.data.type],
  )

  return (
    <div className="flex items-center space-x-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
        {icon}
      </div>
      <div className="min-w-0 flex-1 py-1.5 text-sm text-gray-500">
        <span className="font-medium text-gray-900">{activity.actor}</span>
        &nbsp;{renderAction()}&nbsp;
        <span className="whitespace-nowrap">
          {formatDurationMs(now.getTime() - activity.ts.getTime())} ago
        </span>
      </div>
    </div>
  )
}
