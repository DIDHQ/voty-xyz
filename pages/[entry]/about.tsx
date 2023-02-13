import useRouterQuery from '../../hooks/use-router-query'
import { useEntry } from '../../hooks/use-api'
import CommunityLayout from '../../components/layouts/community'
import Markdown from '../../components/basic/markdown'

export default function CommunityAboutPage() {
  const [query] = useRouterQuery<['entry']>()
  const { data: community } = useEntry(query.entry)

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
