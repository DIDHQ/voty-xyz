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
                <div className="rounded border p-4">
                  <h3 className="text-xl font-semibold">Schedule</h3>
                  <nav className="mt-4 border-t pt-4">
                    <ol
                      role="list"
                      className="space-y-4 md:flex md:space-y-0 md:space-x-4"
                    >
                      <li style={{ flex: Math.sqrt(group.duration.pending) }}>
                        <div className="flex flex-col border-l-4 border-yellow-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0">
                          <span className="text-sm font-medium text-yellow-600">
                            Pending
                          </span>
                          <span className="text-sm font-medium">
                            {formatDuration(group.duration.pending)}
                          </span>
                        </div>
                      </li>
                      <li
                        style={{
                          flex: Math.sqrt(
                            (group as Grant).duration.adding_option,
                          ),
                        }}
                      >
                        <div className="flex flex-col border-l-4 border-purple-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0">
                          <span className="text-sm font-medium text-purple-600">
                            Proposing
                          </span>
                          <span className="text-sm font-medium">
                            {formatDuration(
                              (group as Grant).duration.adding_option,
                            )}
                          </span>
                        </div>
                      </li>
                      <li style={{ flex: Math.sqrt(group.duration.voting) }}>
                        <div className="flex flex-col border-l-4 border-green-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0">
                          <span className="text-sm font-medium text-green-600">
                            Voting
                          </span>
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
                <div className="rounded border p-4">
                  <h3 className="text-xl font-semibold">Schedule</h3>
                  <nav className="mt-4 border-t pt-4">
                    <ol
                      role="list"
                      className="space-y-4 md:flex md:space-y-0 md:space-x-4"
                    >
                      <li style={{ flex: Math.sqrt(group.duration.pending) }}>
                        <div className="flex flex-col border-l-4 border-yellow-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0">
                          <span className="text-sm font-medium text-yellow-600">
                            Pending
                          </span>
                          <span className="text-sm font-medium">
                            {formatDuration(group.duration.pending)}
                          </span>
                        </div>
                      </li>
                      <li style={{ flex: Math.sqrt(group.duration.voting) }}>
                        <div className="flex flex-col border-l-4 border-green-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0">
                          <span className="text-sm font-medium text-green-600">
                            Voting
                          </span>
                          <span className="text-sm font-medium">
                            {formatDuration(group.duration.voting)}
                          </span>
                        </div>
                      </li>
                    </ol>
                  </nav>
                </div>
                <div className="rounded border p-4">
                  <h3 className="text-xl font-semibold">
                    Terms and conditions
                  </h3>
                  <Article small className="mt-4 border-t pt-2">
                    <Markdown>{group.extension.terms_and_conditions}</Markdown>
                  </Article>
                </div>
              </div>
            )
          ) : null}
          {isManager ? (
            <Link
              href={`/${query.entry}/${query.group}/settings`}
              className="mt-6 block w-fit"
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
