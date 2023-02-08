import useRouterQuery from '../../../hooks/use-router-query'
import GroupForm from '../../../components/group-form'
import { useEntryConfig, useRetrieve } from '../../../hooks/use-api'
import { DataType } from '../../../src/constants'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'

export default function GroupSettingsPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: config } = useEntryConfig(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)

  return (
    <CommunityLayout>
      <GroupLayout>
        {query.entry && query.group && community ? (
          <GroupForm
            entry={query.entry}
            community={community}
            group={parseInt(query.group)}
            className="pt-6 pl-6"
          />
        ) : null}
      </GroupLayout>
    </CommunityLayout>
  )
}
