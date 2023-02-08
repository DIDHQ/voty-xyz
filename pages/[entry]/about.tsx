import useRouterQuery from '../../hooks/use-router-query'
import useDidRecord from '../../hooks/use-did-record'
import { useRetrieve } from '../../hooks/use-api'
import { DataType } from '../../src/constants'
import CommunityLayout from '../../components/layouts/community'

export default function CommunityAboutPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: record } = useDidRecord(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, record?.community)

  return (
    <CommunityLayout>
      <div className="flex w-full flex-col pt-6 pl-6">
        {community?.extension?.about}
      </div>
    </CommunityLayout>
  )
}
