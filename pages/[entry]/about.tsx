import useRouterQuery from '../../hooks/use-router-query'
import { useEntryConfig, useRetrieve } from '../../hooks/use-api'
import { DataType } from '../../src/constants'
import CommunityLayout from '../../components/layouts/community'

export default function CommunityAboutPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: config } = useEntryConfig(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)

  return (
    <CommunityLayout>
      <div className="flex w-full flex-col pt-6 pl-6">
        {community?.extension?.about}
      </div>
    </CommunityLayout>
  )
}
