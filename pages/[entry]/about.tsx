import useRouterQuery from '../../hooks/use-router-query'
import { useEntryConfig, useRetrieve } from '../../hooks/use-api'
import { DataType } from '../../src/constants'
import CommunityLayout from '../../components/layouts/community'
import Markdown from '../../components/basic/markdown'

export default function CommunityAboutPage() {
  const [query] = useRouterQuery<['entry']>()
  const { data: config } = useEntryConfig(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)

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
