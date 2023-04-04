import clsx from 'clsx'

import { Group } from '../utils/schemas/group'
import { formatDuration } from '../utils/time'
import Article from './basic/article'
import Markdown from './basic/markdown'
import GroupPermission from './group-permission'

export default function GroupAbout(props: {
  entry?: string
  group: Group
  className?: string
}) {
  const { group } = props

  return (
    <div className={clsx('space-y-6', props.className)}>
      <GroupPermission entry={props.entry} group={props.group} />
      <div className="rounded-md border p-4">
        <h3 className="text-xl font-semibold">Rules</h3>
        <nav className="mt-4 border-t pt-4">
          <h4 className="mb-3 text-sm font-semibold">Phases</h4>
          <ol role="list" className="md:flex">
            <li style={{ flex: Math.sqrt(group.duration.announcing) }}>
              <div className="flex flex-col border-l-4 border-amber-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pr-4 md:pt-2">
                <span className="text-sm text-gray-500">Announcing</span>
                <span className="text-sm font-medium">
                  {formatDuration(group.duration.announcing)}
                </span>
              </div>
            </li>
            <li style={{ flex: Math.sqrt(group.duration.voting) }}>
              <div className="flex flex-col border-l-4 border-lime-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pr-4 md:pt-2">
                <span className="text-sm text-gray-500">Voting</span>
                <span className="text-sm font-medium">
                  {formatDuration(group.duration.voting)}
                </span>
              </div>
            </li>
          </ol>
        </nav>
        <Article small className="mt-4 border-t pt-4">
          <h4 className="mb-3 text-sm font-semibold">Criteria for approval</h4>
          <Markdown>{group.extension.criteria_for_approval}</Markdown>
        </Article>
      </div>
    </div>
  )
}
