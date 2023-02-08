import useRouterQuery from '../../../hooks/use-router-query'
import useEntryConfig from '../../../hooks/use-did-config'
import GroupForm from '../../../components/group-form'
import { useRetrieve } from '../../../hooks/use-api'
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
          />
        ) : null}
      </GroupLayout>
    </CommunityLayout>
  )
}
