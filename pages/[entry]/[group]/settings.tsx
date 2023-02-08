import useRouterQuery from '../../../hooks/use-router-query'
import useDidRecord from '../../../hooks/use-did-record'
import GroupForm from '../../../components/group-form'
import { useRetrieve } from '../../../hooks/use-api'
import { DataType } from '../../../src/constants'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'

export default function GroupSettingsPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: record } = useDidRecord(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, record?.community)

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
