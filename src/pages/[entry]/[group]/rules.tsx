import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'

import useRouterQuery from '../../../hooks/use-router-query'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import useGroup from '../../../hooks/use-group'
import Button from '../../../components/basic/button'
import useIsManager from '../../../hooks/use-is-manager'
import { previewCommunityAtom } from '../../../utils/atoms'
import RulesView from '../../../components/rules-view'

export default function GroupRulesPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const { data, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const community = previewCommunity || data
  const group = useGroup(community, query.group)
  const isManager = useIsManager(query.entry)

  return (
    <>
      <LoadingBar loading={isLoading} />
      <CommunityLayout>
        <GroupLayout>
          {group ? (
            <RulesView entry={query.entry} group={group} className="mt-6" />
          ) : null}
          {isManager && !previewCommunity ? (
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
