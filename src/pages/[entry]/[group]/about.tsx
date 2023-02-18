import useRouterQuery from '../../../hooks/use-router-query'
import useGroup from '../../../hooks/use-group'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import Markdown from '../../../components/basic/markdown'
import { trpc } from '../../../utils/trpc'

export default function GroupAboutPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group)

  return (
    <CommunityLayout>
      <GroupLayout>
        <div className="flex w-full flex-col pt-6 sm:pl-6">
          <article className="prose-sm sm:prose prose-pre:overflow-x-auto prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400">
            <Markdown>{group?.extension?.about}</Markdown>
          </article>
        </div>
      </GroupLayout>
    </CommunityLayout>
  )
}
