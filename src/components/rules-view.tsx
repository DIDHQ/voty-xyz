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
            <li
              style={{
                flex: Math.sqrt((group as Grant).duration.adding_option),
              }}
            >
              <div className="flex flex-col border-l-4 border-sky-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pr-4 md:pt-2">
                <span className="text-sm text-gray-500">Proposing</span>
                <span className="text-sm font-medium">
                  {formatDuration((group as Grant).duration.adding_option)}
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
      </div>
    </div>
  ) : (
    <div className={clsx('space-y-6', props.className)}>
      <PermissionCard
        title="Proposers"
        description="SubDIDs who can initiate proposals in this working group"
        entry={props.entry}
        value={group.permission.proposing}
      />
      <PermissionCard
        title="Voters"
        description="SubDIDs who can vote in this workgroup"
        entry={props.entry}
        value={group.permission.voting}
      />
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
