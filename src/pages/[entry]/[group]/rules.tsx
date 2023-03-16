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
import Button from '../../../components/basic/button'
import useIsManager from '../../../hooks/use-is-manager'
import { Grant } from '../../../utils/schemas/group'
import Markdown from '../../../components/basic/markdown'
import PermissionCard from '../../../components/permission-card'

export default function GroupRulesPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group)
  const isManager = useIsManager(query.entry)

  return (
    <>
      <LoadingBar loading={isLoading} />
      <CommunityLayout>
        <GroupLayout>
          {group ? (
            group.extension.type === 'grant' ? (
              <div className="mt-6 space-y-6">
                <PermissionCard
                  title="Investors"
                  description="The following DIDs are eligible to invest"
                  entry={query.entry}
                  value={group.permission.proposing}
                />
                <PermissionCard
                  title="Proposers"
                  description="The following DIDs are eligible to propose"
                  entry={query.entry}
                  value={(group as Grant).permission.adding_option}
                />
                <PermissionCard
                  title="Voters"
                  description="The following DIDs are eligible to vote"
                  entry={query.entry}
                  value={group.permission.voting}
                />
                <div className="rounded border p-6">
                  <h3 className="text-xl font-semibold">Schedule</h3>
                  <Article>
                    <ul>
                      <li>
                        Proposing starts&nbsp;
                        {formatDuration(group.duration.pending)} after
                        transaction confirmation.
                      </li>
                      <li>
                        Voting starts&nbsp;
                        {formatDuration(
                          (group as Grant).duration.adding_option,
                        )}{' '}
                        after proposing starting.
                      </li>
                      <li>
                        Voting ends {formatDuration(group.duration.voting)}
                        &nbsp;after starting.
                      </li>
                    </ul>
                  </Article>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <PermissionCard
                  title="Proposers"
                  description="The following DIDs are eligible to propose"
                  entry={query.entry}
                  value={group.permission.proposing}
                />
                <PermissionCard
                  title="Voters"
                  description="The following DIDs are eligible to vote"
                  entry={query.entry}
                  value={group.permission.voting}
                />
                <div className="rounded border p-6">
                  <h3 className="text-xl font-semibold">Schedule</h3>
                  <Article>
                    <ul>
                      <li>
                        Voting starts&nbsp;
                        {formatDuration(group.duration.pending)} after
                        transaction confirmation.
                      </li>
                      <li>
                        Voting ends {formatDuration(group.duration.voting)}
                        &nbsp;after starting.
                      </li>
                    </ul>
                  </Article>
                </div>
                <div className="rounded border p-6">
                  <h3 className="text-xl font-semibold">
                    Terms and conditions
                  </h3>
                  <Article className="pt-2">
                    <Markdown>{group.extension.terms_and_conditions}</Markdown>
                  </Article>
                </div>
              </div>
            )
          ) : null}
          {isManager ? (
            <Link
              href={`/${query.entry}/${query.group}/settings`}
              className="mt-6"
            >
              <Button icon={PencilIcon} primary>
                Edit
              </Button>
            </Link>
          ) : null}
        </GroupLayout>
      </CommunityLayout>
    </>
  )
}
