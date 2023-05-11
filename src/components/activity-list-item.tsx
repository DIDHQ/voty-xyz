import {
  UserGroupIcon,
  BriefcaseIcon,
  TrophyIcon,
  BoltIcon,
  HandRaisedIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/20/solid'
import { ExoticComponent, ReactNode, useMemo } from 'react'
import clsx from 'clsx'

import { Activity } from '../utils/schemas/activity'
import { formatDurationMs } from '../utils/time'
import TextButton from './basic/text-button'
import useNow from '../hooks/use-now'

import { permalink2Explorer, permalink2Id } from '../utils/permalink'

export default function ActivityListItem(props: {
  activity: { data: Activity; ts: Date; actor: string }
}) {
  const { activity } = props
  const now = useNow()
  const action = useMemo<{
    color: string
    icon: ExoticComponent<{ className?: string }>
    children: ReactNode
    permalink?: string
  }>(() => {
    switch (activity.data.type) {
      case 'create_community': {
        return {
          color: 'bg-orange-100 text-orange-500',
          icon: UserGroupIcon,
          children: 'imported community',
          permalink: activity.data.community_permalink,
        }
      }
      case 'update_community': {
        return {
          color: 'bg-orange-100 text-orange-500',
          icon: UserGroupIcon,
          children: 'updated community',
          permalink: activity.data.community_permalink,
        }
      }
      case 'create_grant': {
        return {
          color: 'bg-amber-100 text-amber-500',
          icon: TrophyIcon,
          children: (
            <>
              created topic grant{' '}
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
          ),
          permalink: activity.data.grant_permalink,
        }
      }
      case 'create_grant_proposal': {
        return {
          color: 'bg-sky-100 text-sky-500',
          icon: HandRaisedIcon,
          children: (
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
              in topic grant{' '}
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
          ),
          permalink: activity.data.grant_proposal_permalink,
        }
      }
      case 'create_grant_proposal_vote': {
        return {
          color: 'bg-lime-100 text-lime-500',
          icon: BoltIcon,
          children: (
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
              in topic grant{' '}
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
          ),
          permalink: activity.data.grant_proposal_vote_permalink,
        }
      }
      case 'create_group': {
        return {
          color: 'bg-indigo-100 text-indigo-500',
          icon: BriefcaseIcon,
          children: (
            <>
              created workgroup{' '}
              <TextButton
                href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
                underline
                className="font-medium text-gray-900"
              >
                {activity.data.group_name}
              </TextButton>
            </>
          ),
          permalink: activity.data.group_permalink,
        }
      }
      case 'update_group': {
        return {
          color: 'bg-indigo-100 text-indigo-500',
          icon: BriefcaseIcon,
          children: (
            <>
              updated workgroup{' '}
              <TextButton
                href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
                underline
                className="font-medium text-gray-900"
              >
                {activity.data.group_name}
              </TextButton>
            </>
          ),
          permalink: activity.data.group_permalink,
        }
      }
      case 'delete_group': {
        return {
          color: 'bg-red-100 text-red-500',
          icon: BriefcaseIcon,
          children: (
            <>
              archived workgroup{' '}
              <span className="font-medium text-gray-900">
                {activity.data.group_name}
              </span>
            </>
          ),
        }
      }
      case 'create_group_proposal': {
        return {
          color: 'bg-sky-100 text-sky-500',
          icon: HandRaisedIcon,
          children: (
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
              in workgroup{' '}
              <TextButton
                href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
                underline
                className="font-medium text-gray-900"
              >
                {activity.data.group_proposal_title}
              </TextButton>
            </>
          ),
          permalink: activity.data.group_proposal_permalink,
        }
      }
      case 'create_group_proposal_vote': {
        return {
          color: 'bg-lime-100 text-lime-500',
          icon: BoltIcon,
          children: (
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
              in workgroup{' '}
              <TextButton
                href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
                underline
                className="font-medium text-gray-900"
              >
                {activity.data.group_proposal_title}
              </TextButton>
            </>
          ),
          permalink: activity.data.group_proposal_vote_permalink,
        }
      }
      default: {
        return {
          color: 'bg-gray-100 text-gray-500',
          icon: QuestionMarkCircleIcon,
          children: 'did something',
        }
      }
    }
  }, [activity.data])

  return (
    <div className="flex items-center space-x-2">
      <div
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white',
          action.color,
        )}
      >
        {<action.icon className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1 py-1.5 text-sm text-gray-500">
        <span className="font-medium text-gray-900">{activity.actor}</span>{' '}
        {action.children}{' '}
        {action.permalink ? (
          <a
            href={permalink2Explorer(action.permalink)}
            className="whitespace-nowrap"
          >
            {formatDurationMs(now.getTime() - activity.ts.getTime())} ago
          </a>
        ) : (
          <span className="whitespace-nowrap">
            {formatDurationMs(now.getTime() - activity.ts.getTime())} ago
          </span>
        )}
      </div>
    </div>
  )
}
