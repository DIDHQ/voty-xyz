import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import useArweaveData from '../../hooks/use-arweave-data'
import useDidConfig from '../../hooks/use-did-config'
import GroupForm from '../../components/group-form'
import { communityWithSignatureSchema } from '../../src/schemas'

export default function CommunitySettingsPage() {
  const [query] = useRouterQuery<['did', 'group']>()
  const { data: config } = useDidConfig(query.did)
  const { data: community } = useArweaveData(
    communityWithSignatureSchema,
    config?.community,
  )

  return query.did ? (
    <div className="flex flex-col w-full px-8">
      {query.group ? (
        community ? (
          <GroupForm community={community} group={query.group} />
        ) : null
      ) : (
        <CommunityForm did={query.did} community={community} />
      )}
    </div>
  ) : null
}
