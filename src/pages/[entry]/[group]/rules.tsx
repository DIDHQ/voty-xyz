import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'

import useRouterQuery from '../../../hooks/use-router-query'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import useGroup from '../../../hooks/use-group'
import { formatDuration } from '../../../utils/time'
import Article from '../../../components/basic/article'
import { BooleanSets, DecimalSets } from '../../../utils/schemas/sets'
import Button from '../../../components/basic/button'
import useIsManager from '../../../hooks/use-is-manager'

export default function GroupRulesPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group, 'workgroup')
  const isManager = useIsManager(query.entry)

  return (
    <>
      <LoadingBar loading={isLoading} />
      <CommunityLayout>
        <GroupLayout>
          {group ? (
            <>
              {isManager ? (
                <Link
                  href={`/${query.entry}/${query.group}/settings`}
                  className="float-right mt-5"
                >
                  <Button icon={PencilIcon} primary>
                    Edit
                  </Button>
                </Link>
              ) : null}
              <article className="prose max-w-none pt-6 prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400">
                <h3>Proposing</h3>
                <em>The following DIDs are eligible to propose</em>
                <SetsDescription
                  entry={query.entry}
                  value={group.permission.proposing}
                />
                <h3>Voting</h3>
                <em>
                  The following DIDs are eligible to vote
                  <br />
                  The voting power is calculated based on the maximum value
                </em>
                <SetsDescription
                  entry={query.entry}
                  value={group.permission.voting}
                />
                <h3>Schedule</h3>
                <ul>
                  <li>
                    Voting starts&nbsp;
                    {formatDuration(group.duration.pending)} after transaction
                    confirmation.
                  </li>
                  <li>
                    Voting ends {formatDuration(group.duration.voting)}
                    &nbsp;after starting.
                  </li>
                </ul>
                <h3>Terms and conditions</h3>
              </article>
              <Article className="mt-3">
                {group.extension.terms_and_conditions}
              </Article>
            </>
          ) : null}
        </GroupLayout>
      </CommunityLayout>
    </>
  )
}

function SetsDescription(props: {
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
