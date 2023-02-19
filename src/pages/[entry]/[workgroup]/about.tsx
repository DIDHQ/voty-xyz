import useRouterQuery from '../../../hooks/use-router-query'
import useWorkgroup from '../../../hooks/use-workgroup'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'

export default function WorkgroupAboutPage() {
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const workgroup = useWorkgroup(community, query.workgroup)

  return (
    <CommunityLayout>
      <WorkgroupLayout>
        <Article className="pt-6 sm:pl-6">
          {workgroup?.extension?.about}
        </Article>
      </WorkgroupLayout>
    </CommunityLayout>
  )
}
