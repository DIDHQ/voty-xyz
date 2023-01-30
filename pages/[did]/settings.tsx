import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import useDidConfig from '../../hooks/use-did-config'
import GroupForm from '../../components/group-form'
import { useCommunity } from '../../hooks/use-api'

export default function CommunitySettingsPage() {
  const [query] = useRouterQuery<['did', 'group']>()
  const { data: config } = useDidConfig(query.did)
  const { data: community } = useCommunity(config?.community)

  return query.did ? (
    <div className="flex flex-col w-full px-8">
      {query.group ? (
        community ? (
          <GroupForm
            entry={query.did}
            community={community}
            group={query.group}
          />
        ) : null
      ) : (
        <CommunityForm entry={query.did} community={community} />
      )}
    </div>
  ) : null
}
