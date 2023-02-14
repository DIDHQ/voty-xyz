import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import Markdown from '../../components/basic/markdown'
import { trpc } from '../../utils/trpc'

export default function CommunityAboutPage() {
  const query = useRouterQuery<['entry']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )

  return (
    <CommunityLayout>
      <div className="flex w-full flex-col pt-6 pl-6">
        <article className="prose">
          <Markdown>{community?.extension?.about}</Markdown>
        </article>
      </div>
    </CommunityLayout>
  )
}
