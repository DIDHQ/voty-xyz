import useRouterQuery from '../../../hooks/use-router-query'
import GroupForm from '../../../components/group-form'
import { useCommunity } from '../../../hooks/use-api'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'

export default function GroupSettingsPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: community } = useCommunity(query.entry)

  return (
    <CommunityLayout>
      <GroupLayout>
        {query.entry && query.group && community ? (
          <GroupForm
            entry={query.entry}
            community={community}
            group={query.group}
            className="pl-6"
          />
        ) : null}
      </GroupLayout>
    </CommunityLayout>
  )
}
