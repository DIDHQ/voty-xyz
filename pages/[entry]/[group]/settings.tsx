import CommunityForm from '../../../components/community-form'
import useRouterQuery from '../../../hooks/use-router-query'
import useDidConfig from '../../../hooks/use-did-config'
import GroupForm from '../../../components/group-form'
import { useRetrieve } from '../../../hooks/use-api'
import { DataType } from '../../../src/constants'

export default function GroupSettingsPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: config } = useDidConfig(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)

  return query.entry ? (
    <div className="flex w-full flex-col">
      {query.group ? (
        community ? (
          <GroupForm
            entry={query.entry}
            community={community}
            group={parseInt(query.group)}
          />
        ) : null
      ) : (
        <CommunityForm entry={query.entry} community={community} />
      )}
    </div>
  ) : null
}
