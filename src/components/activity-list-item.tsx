import { UserCircleIcon } from '@heroicons/react/20/solid'

import { Activity } from '../utils/schemas/activity'
import { formatDurationMs } from '../utils/time'
import TextButton from './basic/text-button'
import useNow from '../hooks/use-now'

export default function ActivityListItem(props: {
  activity: { data: Activity; ts: Date; actor: string }
}) {
  const { activity } = props
  const now = useNow()

  return (
    <div className="flex items-center space-x-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
        <UserCircleIcon className="h-5 w-5 text-gray-500" />
      </div>
      <div className="min-w-0 flex-1 py-1.5 text-sm text-gray-500">
        <span className="font-medium text-gray-900">{activity.actor}</span>
        &nbsp;{activity.data.type}&nbsp;
        <TextButton
          href={`/${activity.data.community_id}`}
          className="font-medium text-gray-900"
        >
          {activity.data.community_name}
        </TextButton>
        &nbsp;
        <span className="whitespace-nowrap">
          {formatDurationMs(now.getTime() - activity.ts.getTime())} ago
        </span>
      </div>
    </div>
  )
}
