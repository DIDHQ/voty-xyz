import useRouterQuery from '../../../hooks/use-router-query'
import { useGroup } from '../../../hooks/use-api'
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
        <div className="flex w-full flex-col pt-6 pl-6">
          <article className="prose">
            <Markdown>{group?.extension?.about}</Markdown>
          </article>
        </div>
      </GroupLayout>
    </CommunityLayout>
  )
}
