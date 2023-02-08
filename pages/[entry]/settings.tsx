import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import useDidRecord from '../../hooks/use-did-record'
import { useRetrieve } from '../../hooks/use-api'
import { DataType } from '../../src/constants'
import CommunityLayout from '../../components/layouts/community'

export default function CommunitySettingsPage() {
  const [query] = useRouterQuery<['entry']>()
  const { data: record } = useDidRecord(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, record?.community)

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
