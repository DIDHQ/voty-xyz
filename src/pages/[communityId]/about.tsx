import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'

import CommunityLayout from '../../components/layouts/community'
import Article from '../../components/basic/article'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import Button from '../../components/basic/button'
import useRouterQuery from '../../hooks/use-router-query'
import useIsManager from '../../hooks/use-is-manager'
import MarkdownViewer from '../../components/basic/markdown-viewer'
import { previewCommunityAtom } from '../../utils/atoms'

export default function CommunityAboutPage() {
  const query = useRouterQuery<['communityId']>()
  const { data, isLoading } = trpc.community.getById.useQuery(
    { id: query.communityId },
    { enabled: !!query.communityId },
  )
  const isManager = useIsManager(query.communityId)
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const community = previewCommunity || data

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      {community?.about ? (
        <Article className="mt-6 w-full sm:mt-8">
          <h1>About</h1>
          <MarkdownViewer preview={!!previewCommunity}>
            {community?.about}
          </MarkdownViewer>
        </Article>
      ) : null}
      {isManager && !previewCommunity ? (
        <Link
          href={`/${query.communityId}/settings`}
          className="mt-6 block w-fit sm:mt-8"
        >
          <Button icon={PencilIcon}>Edit</Button>
        </Link>
      ) : null}
    </CommunityLayout>
  )
}
