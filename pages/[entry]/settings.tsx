import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import useEntryConfig from '../../hooks/use-did-config'
import { useRetrieve } from '../../hooks/use-api'
import { DataType } from '../../src/constants'
import CommunityLayout from '../../components/layouts/community'

export default function CommunitySettingsPage() {
  const [query] = useRouterQuery<['entry']>()
  const { data: config } = useEntryConfig(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)

  return (
    <CommunityLayout>
      {query.entry ? (
        <div className="flex w-full flex-col">
          <CommunityForm entry={query.entry} community={community} />
        </div>
      ) : null}
    </CommunityLayout>
  )
}
