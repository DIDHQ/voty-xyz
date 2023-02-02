import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import useDidConfig from '../../hooks/use-did-config'
import GroupForm from '../../components/group-form'
import { useRetrieve } from '../../hooks/use-api'
import { DataType } from '../../src/constants'

export default function CommunitySettingsPage() {
  const [query] = useRouterQuery<['did', 'group']>()
  const { data: config } = useDidConfig(query.did)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)

  return query.did ? (
    <div className="flex w-full flex-col px-8">
      {query.group ? (
        community ? (
          <GroupForm
            entry={query.did}
            community={community}
            group={parseInt(query.group)}
          />
        ) : null
      ) : (
        <CommunityForm entry={query.did} community={community} />
      )}
    </div>
  ) : null
}
