import { clsx } from 'clsx'

import { Group } from '../utils/schemas/v1/group'
import { formatDuration } from '../utils/time'
import Article from './basic/article'
import MarkdownViewer from './basic/markdown-viewer'
import PermissionCard from './permission-card'
import Card from './basic/card'

export default function GroupAbout(props: {
  group: Group
  className?: string
}) {
  const { group } = props

  return (
    <div className={clsx('space-y-6', props.className)}>
      <PermissionCard
        title="Proposers"
        description="Second-Level DIDs who can initiate proposals in this workgroup."
        value={props.group.permission.proposing}
      />

      <PermissionCard
        title="Voters"
        description="Second-Level DIDs who can vote in this workgroup. The greatest voting power will be allocated when a Second-Level DID has multiple occurrence."
        value={props.group.permission.voting}
      />

      <Card title="Proposal rules">
        <div>
          <h4 className="mb-3 text-sm-semibold text-strong">Phases</h4>

          <div className="rounded-xl bg-moderate p-4 pt-5">
            <ol className="md:flex">
              <li style={{ flex: Math.sqrt(group.duration.announcing) }}>
                <div className="flex flex-col border-l-4 border-sky-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pr-4 md:pt-2">
                  <span className="text-sm text-subtle">Announcing</span>
                  <span className="text-sm font-medium text-strong">
                    {formatDuration(group.duration.announcing)}
                  </span>
                </div>
              </li>
              <li style={{ flex: Math.sqrt(group.duration.voting) }}>
                <div className="flex flex-col border-l-4 border-lime-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pr-4 md:pt-2">
                  <span className="text-sm text-subtle">Voting</span>
                  <span className="text-sm font-medium text-strong">
                    {formatDuration(group.duration.voting)}
                  </span>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <Article small className="mt-6">
          <h4 className="text-sm-semibold text-strong">
            Criteria for approval
          </h4>

          <MarkdownViewer>{group.criteria_for_approval}</MarkdownViewer>
        </Article>
      </Card>
    </div>
  )
}
