import clsx from 'clsx'

import { Grant, Group } from '../utils/schemas/group'
import { formatDuration } from '../utils/time'
import Article from './basic/article'
import Markdown from './basic/markdown'
import PermissionCard from './permission-card'

export default function RulesView(props: {
  entry?: string
  group: Group
  className?: string
}) {
  const { group } = props

  return group.extension.type === 'grant' ? (
    <div className={clsx('space-y-6', props.className)}>
      <PermissionCard
        title="Investors"
        description="are eligible to open new rounds to this grant"
        entry={props.entry}
        value={group.permission.proposing}
      />
      <PermissionCard
        title="Proposers"
        description="are eligible to create proposals of rounds to this grant"
        entry={props.entry}
        value={(group as Grant).permission.adding_option}
      />
      <PermissionCard
        title="Voters"
        description="are eligible to vote for proposals to this grant"
        entry={props.entry}
        value={group.permission.voting}
      />
      <div className="rounded-md border p-4">
        <h3 className="text-xl font-semibold">Schedule</h3>
        <nav className="mt-4 border-t pt-4">
          <ol role="list" className="md:flex">
            <li style={{ flex: Math.sqrt(group.duration.pending) }}>
              <div className="flex flex-col border-l-4 border-amber-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0 md:pr-4">
                <span className="text-sm text-gray-500">Pending</span>
                <span className="text-sm font-medium">
                  {formatDuration(group.duration.pending)}
                </span>
              </div>
            </li>
            <li
              style={{
                flex: Math.sqrt((group as Grant).duration.adding_option),
              }}
            >
              <div className="flex flex-col border-l-4 border-sky-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0 md:pr-4">
                <span className="text-sm text-gray-500">Proposing</span>
                <span className="text-sm font-medium">
                  {formatDuration((group as Grant).duration.adding_option)}
                </span>
              </div>
            </li>
            <li style={{ flex: Math.sqrt(group.duration.voting) }}>
              <div className="flex flex-col border-l-4 border-lime-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0 md:pr-4">
                <span className="text-sm text-gray-500">Voting</span>
                <span className="text-sm font-medium">
                  {formatDuration(group.duration.voting)}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  ) : (
    <div className={clsx('space-y-6', props.className)}>
      <PermissionCard
        title="Proposers"
        description="are eligible to create proposals in this workgroup"
        entry={props.entry}
        value={group.permission.proposing}
      />
      <PermissionCard
        title="Voters"
        description="are eligible to vote for proposals in this workgroup"
        entry={props.entry}
        value={group.permission.voting}
      />
      <div className="rounded-md border p-4">
        <h3 className="text-xl font-semibold">Schedule</h3>
        <nav className="mt-4 border-t pt-4">
          <ol role="list" className="md:flex">
            <li style={{ flex: Math.sqrt(group.duration.pending) }}>
              <div className="flex flex-col border-l-4 border-amber-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0 md:pr-4">
                <span className="text-sm text-gray-500">Pending</span>
                <span className="text-sm font-medium">
                  {formatDuration(group.duration.pending)}
                </span>
              </div>
            </li>
            <li style={{ flex: Math.sqrt(group.duration.voting) }}>
              <div className="flex flex-col border-l-4 border-lime-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0 md:pr-4">
                <span className="text-sm text-gray-500">Voting</span>
                <span className="text-sm font-medium">
                  {formatDuration(group.duration.voting)}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      <div className="rounded-md border p-4">
        <h3 className="text-xl font-semibold">Criteria for approval</h3>
        <Article small className="mt-4 border-t pt-2">
          <Markdown>{group.extension.terms_and_conditions}</Markdown>
        </Article>
      </div>
    </div>
  )
}
