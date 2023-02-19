import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import Article from '../../components/basic/article'
import { trpc } from '../../utils/trpc'

export default function CommunityAboutPage() {
  const query = useRouterQuery<['entry']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )

  return (
    <CommunityLayout>
      <Article className="w-full pt-6 sm:pl-6">
        {community?.extension?.about}
      </Article>
    </CommunityLayout>
  )
}
