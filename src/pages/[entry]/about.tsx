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
      <article className="prose-sm pt-6 sm:prose prose-pre:overflow-x-auto prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400 sm:pl-6">
        <Markdown>{community?.extension?.about}</Markdown>
      </article>
    </CommunityLayout>
  )
}
