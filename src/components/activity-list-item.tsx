import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CursorArrowRippleIcon,
  Square3Stack3DIcon,
  UserGroupIcon,
  TrophyIcon,
  StarIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { ExoticComponent, ReactNode, useMemo } from 'react'
import { clsx } from 'clsx'

import { tv } from 'tailwind-variants'
import { Activity } from '../utils/schemas/activity'
import { formatDurationMs } from '../utils/time'
import useNow from '../hooks/use-now'
import { permalink2Explorer, permalink2Id } from '../utils/permalink'
import { formatDid } from '../utils/did/utils'
import TextLink from './basic/text-link'

const activityLinkClass = tv({
  base: 'font-normal',
})

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
          color: 'bg-orange-100 text-orange-900',
          icon: UserGroupIcon,
          children: 'imported community',
          permalink: activity.data.community_permalink,
        }
      }
      case 'update_community': {
        return {
          color: 'bg-orange-100 text-orange-900',
          icon: ArrowPathIcon,
          children: 'updated community',
          permalink: activity.data.community_permalink,
        }
      }
      case 'create_grant': {
        return {
          color: 'bg-mypink-100 text-mypink-900',
          icon: TrophyIcon,
          children: (
            <>
              created Topic Grant{' '}
              <TextLink
                href={`/${activity.data.community_id}/grant/${permalink2Id(
                  activity.data.grant_permalink,
                )}`}
                className={activityLinkClass()}
              >
                {activity.data.grant_name}
              </TextLink>
            </>
          ),
          permalink: activity.data.grant_permalink,
        }
      }
      case 'create_grant_proposal': {
        return {
          color: 'bg-myblue-100 text-myblue-900',
          icon: Square3Stack3DIcon,
          children: (
            <>
              wrote a proposal{' '}
              <TextLink
                href={`/grant-proposal/${permalink2Id(
                  activity.data.grant_proposal_permalink,
                )}`}
                className={activityLinkClass()}
              >
                {activity.data.grant_proposal_title}
              </TextLink>{' '}
              {/* in Topic Grant{' '}
              <TextLink
                href={`/${activity.data.community_id}/grant/${permalink2Id(
                  activity.data.grant_permalink,
                )}`}
                className={activityLinkClass()}>
                {activity.data.grant_name}
              </TextLink> */}
            </>
          ),
          permalink: activity.data.grant_proposal_permalink,
        }
      }
      case 'create_grant_proposal_select': {
        return {
          color: 'bg-myyellow-100 text-myyellow-900',
          icon: StarIcon,
          children: (
            <>
              selected proposal{' '}
              <TextLink
                href={`/grant-proposal/${permalink2Id(
                  activity.data.grant_proposal_permalink,
                )}`}
                className={activityLinkClass()}
              >
                {activity.data.grant_proposal_title}
              </TextLink>{' '}
              {/* in Topic Grant{' '}
              <TextLink
                href={`/grant-proposal/${permalink2Id(
                  activity.data.grant_permalink,
                )}`}
                className={activityLinkClass()}>
                {activity.data.grant_name}
              </TextLink> */}
            </>
          ),
          permalink: activity.data.grant_proposal_select_permalink,
        }
      }
      case 'create_grant_proposal_vote': {
        return {
          color: 'bg-mygreen-100 text-mygreen-900',
          icon: CursorArrowRippleIcon,
          children: (
            <>
              voted for proposal{' '}
              <TextLink
                href={`/grant-proposal/${permalink2Id(
                  activity.data.grant_proposal_permalink,
                )}`}
                className={activityLinkClass()}
              >
                {activity.data.grant_proposal_title}
              </TextLink>{' '}
              {/* in Topic Grant{' '}
              <TextLink
                href={`/${activity.data.community_id}/grant/${permalink2Id(
                  activity.data.grant_permalink,
                )}`}
                className={activityLinkClass()}>
                {activity.data.grant_name}
              </TextLink> */}
            </>
          ),
          permalink: activity.data.grant_proposal_vote_permalink,
        }
      }
      case 'create_group': {
        return {
          color: 'bg-purple-100 text-purple-900',
          icon: BriefcaseIcon,
          children: (
            <>
              created workgroup{' '}
              <TextLink
                href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
                className={activityLinkClass()}
              >
                {activity.data.group_name}
              </TextLink>
            </>
          ),
          permalink: activity.data.group_permalink,
        }
      }
      case 'update_group': {
        return {
          color: 'bg-purple-100 text-purple-900',
          icon: BriefcaseIcon,
          children: (
            <>
              updated workgroup{' '}
              <TextLink
                href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
                className={activityLinkClass()}
              >
                {activity.data.group_name}
              </TextLink>
            </>
          ),
          permalink: activity.data.group_permalink,
        }
      }
      case 'delete_group': {
        return {
          color: 'bg-myred-100 text-myred-900',
          icon: ArchiveBoxIcon,
          children: (
            <>
              archived workgroup{' '}
              <span className="text-strong">{activity.data.group_name}</span>
            </>
          ),
        }
      }
      case 'create_group_proposal': {
        return {
          color: 'bg-myblue-100 text-myblue-900',
          icon: Square3Stack3DIcon,
          children: (
            <>
              wrote a proposal{' '}
              <TextLink
                href={`/group-proposal/${permalink2Id(
                  activity.data.group_proposal_permalink,
                )}`}
                className={activityLinkClass()}
              >
                {activity.data.group_proposal_title}
              </TextLink>{' '}
              {/* in workgroup{' '}
              <TextLink
                href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
                className={activityLinkClass()}>
                {activity.data.group_name}
              </TextLink> */}
            </>
          ),
          permalink: activity.data.group_proposal_permalink,
        }
      }
      case 'create_group_proposal_vote': {
        return {
          color: 'bg-mygreen-100 text-mygreen-900',
          icon: CursorArrowRippleIcon,
          children: (
            <>
              voted for{' '}
              <span className="text-strong">
                {activity.data.group_proposal_vote_choices.length === 1
                  ? activity.data.group_proposal_vote_choices[0]
                  : `${activity.data.group_proposal_vote_choices.length} choices`}
              </span>{' '}
              in proposal{' '}
              <TextLink
                href={`/group-proposal/${permalink2Id(
                  activity.data.group_proposal_permalink,
                )}`}
                className={activityLinkClass()}
              >
                {activity.data.group_proposal_title}
              </TextLink>{' '}
              {/* of workgroup{' '}
              <TextLink
                href={`/${activity.data.community_id}/group/${activity.data.group_id}`}
                className={activityLinkClass()}>
                {activity.data.group_name}
              </TextLink> */}
            </>
          ),
          permalink: activity.data.group_proposal_vote_permalink,
        }
      }
      default: {
        return {
          color: 'bg-moderate text-semistrong',
          icon: QuestionMarkCircleIcon,
          children: 'did something',
        }
      }
    }
  }, [activity.data])

  return (
    <div className="flex items-start gap-4 py-4 md:px-3">
      <div
        className={clsx(
          'mt-1 flex h-8 w-8 items-center justify-center rounded-xl',
          action.color,
        )}
      >
        {<action.icon className="h-4 w-4" />}
      </div>

      <div className="flex-1 whitespace-normal break-words">
        <div className="text-sm-regular text-moderate">
          <span className="text-strong">{formatDid(activity.actor)}</span>{' '}
          {action.children}
        </div>

        <div className="mt-1 text-xs-regular text-subtle">
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
    </div>
  )
}
