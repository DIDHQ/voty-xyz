import useRouterQuery from '../../../hooks/use-router-query'
import useWorkgroup from '../../../hooks/use-workgroup'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import Markdown from '../../../components/basic/markdown'
import { trpc } from '../../../utils/trpc'

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
        <article className="prose-sm flex w-full flex-col pt-6 sm:prose prose-pre:overflow-x-auto prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400 sm:pl-6">
          <Markdown>{workgroup?.extension?.about}</Markdown>
        </article>
      </WorkgroupLayout>
    </CommunityLayout>
  )
}
