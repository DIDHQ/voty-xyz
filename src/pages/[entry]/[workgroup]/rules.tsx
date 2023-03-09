import useRouterQuery from '../../../hooks/use-router-query'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import useWorkgroup from '../../../hooks/use-workgroup'
import { formatDuration } from '../../../utils/time'
import Article from '../../../components/basic/article'
import { BooleanSets, DecimalSets } from '../../../utils/schemas/sets'

export function SetsDescription(props: {
  entry?: string
  value: BooleanSets | DecimalSets
}) {
  return (
    <ul>
      {props.value.operands.map((operand, index) => (
        <li key={index}>
          {operand.name ? (
            <>
              <b>{operand.name}</b>:
            </>
          ) : null}
          {operand.arguments[1].length
            ? null
            : operand.arguments[0] === 'bit'
            ? ' All .bit accounts'
            : ` All SubDIDs of ${props.entry}`}
          {operand.arguments[2] ? ` (Power: ${operand.arguments[2]})` : null}
          {operand.arguments[1].length ? (
            <ul>
              {operand.arguments[1].map((argument) => (
                <li key={argument}>
                  {argument}.{operand.arguments[0]}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default function WorkgroupRulesPage() {
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const workgroup = useWorkgroup(community, query.workgroup)

  return (
    <>
      <LoadingBar loading={isLoading} />
      <CommunityLayout>
        <WorkgroupLayout>
          {workgroup ? (
            <>
              <article className="prose max-w-none pt-6 prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400">
                <h3>Proposing</h3>
                <em>The following DIDs are eligible to propose</em>
                <SetsDescription
                  entry={query.entry}
                  value={workgroup.permission.proposing}
                />
                <h3>Voting</h3>
                <em>
                  The following DIDs are eligible to vote
                  <br />
                  The voting power is calculated based on the maximum value
                </em>
                <SetsDescription
                  entry={query.entry}
                  value={workgroup.permission.voting}
                />
                <h3>Schedule</h3>
                <ul>
                  <li>
                    Voting starts&nbsp;
                    {formatDuration(workgroup.duration.announcement)} after
                    transaction confirmation.
                  </li>
                  <li>
                    Voting ends {formatDuration(workgroup.duration.voting)}
                    &nbsp;after starting.
                  </li>
                </ul>
                <h3>Terms and conditions</h3>
              </article>
              <Article className="mt-3">
                {workgroup.extension.terms_and_conditions}
              </Article>
            </>
          ) : null}
        </WorkgroupLayout>
      </CommunityLayout>
    </>
  )
}
