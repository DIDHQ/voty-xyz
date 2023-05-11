import {
  UserGroupIcon,
  BriefcaseIcon,
  TrophyIcon,
  BoltIcon,
  HandRaisedIcon,
} from '@heroicons/react/20/solid'
import { useCallback, useMemo } from 'react'
import { last } from 'lodash-es'
import clsx from 'clsx'

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
        return 'imported community'
      }
      case 'update_community': {
        return 'updated community'
      }
      case 'create_grant': {
        return (
          <>
            created grant{' '}
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
      case 'create_grant_proposal': {
        return (
          <>
            made a proposal{' '}
            <TextButton
              href={`/${activity.data.community_id}/grant/${permalink2Id(
                activity.data.grant_permalink,
              )}/proposal/${permalink2Id(
                activity.data.grant_proposal_permalink,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.grant_name}
            </TextButton>{' '}
            of grant{' '}
            <TextButton
              href={`/${activity.data.community_id}/grant/${permalink2Id(
                activity.data.grant_permalink,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.grant_proposal_title}
            </TextButton>
          </>
        )
      }
      case 'create_grant_proposal_vote': {
        return (
          <>
            voted for proposal{' '}
            <TextButton
              href={`/${activity.data.community_id}/grant/${permalink2Id(
                activity.data.grant_permalink,
              )}/proposal/${permalink2Id(
                activity.data.grant_proposal_permalink,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.grant_name}
            </TextButton>{' '}
            of grant{' '}
            <TextButton
              href={`/${activity.data.community_id}/grant/${permalink2Id(
                activity.data.grant_permalink,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.grant_proposal_title}
            </TextButton>
          </>
        )
      }
      case 'create_group': {
        return (
          <>
            created group{' '}
            <TextButton
              href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
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
            updated group{' '}
            <TextButton
              href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
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
            archived group{' '}
            <span className="font-medium text-gray-900">
              {activity.data.group_name}
            </span>
          </>
        )
      }
      case 'create_group_proposal': {
        return (
          <>
            made a proposal{' '}
            <TextButton
              href={`/${activity.data.community_id}/group/${
                activity.data.group_id
              }/proposal/${permalink2Id(
                activity.data.group_proposal_permalink,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.group_name}
            </TextButton>{' '}
            of group{' '}
            <TextButton
              href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.group_proposal_title}
            </TextButton>
          </>
        )
      }
      case 'create_group_proposal_vote': {
        return (
          <>
            voted in proposal{' '}
            <TextButton
              href={`/${activity.data.community_id}/group/${
                activity.data.group_id
              }/proposal/${permalink2Id(
                activity.data.group_proposal_permalink,
              )}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.group_name}
            </TextButton>{' '}
            of group{' '}
            <TextButton
              href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
              underline
              className="font-medium text-gray-900"
            >
              {activity.data.group_proposal_title}
            </TextButton>
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
        community: <UserGroupIcon className="h-5 w-5" />,
        group: <BriefcaseIcon className="h-5 w-5" />,
        grant: <TrophyIcon className="h-5 w-5" />,
        proposal: <HandRaisedIcon className="h-5 w-5" />,
        vote: <BoltIcon className="h-5 w-5" />,
      }[last(activity.data.type.split('_'))!]),
    [activity.data.type],
  )
  const color = useMemo(
    () =>
      ({
        create: 'bg-green-100 text-green-500',
        update: 'bg-blue-100 text-blue-500',
        delete: 'bg-red-100 text-red-500',
      }[activity.data.type.split('_')[0]]),
    [activity.data.type],
  )

  return (
    <div className="flex items-center space-x-2">
      <div
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white',
          color,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 py-1.5 text-sm text-gray-500">
        <span className="font-medium text-gray-900">{activity.actor}</span>{' '}
        {renderAction()}{' '}
        <span className="whitespace-nowrap">
          {formatDurationMs(now.getTime() - activity.ts.getTime())} ago
        </span>
      </div>
    </div>
  )
}
