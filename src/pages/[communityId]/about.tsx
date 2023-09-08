import Link from 'next/link'
import { useAtomValue } from 'jotai'

import CommunityLayout from '../../components/layouts/community'
import Article from '../../components/basic/article'
import { trpc } from '../../utils/trpc'
import Button from '../../components/basic/button'
import useRouterQuery from '../../hooks/use-router-query'
import useIsManager from '../../hooks/use-is-manager'
import MarkdownViewer from '../../components/basic/markdown-viewer'
import { previewCommunityAtom } from '../../utils/atoms'
import Card from '@/src/components/basic/card'
import SectionHeader from '@/src/components/basic/section-header'
import { formatDid } from '@/src/utils/did/utils'

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
    <CommunityLayout loading={isLoading}>
      {community?.about ? (
        <>
          <SectionHeader title="About">
            {isManager && !previewCommunity && query.communityId ? (
              <Link
                href={`/${formatDid(query.communityId)}/settings`}
                className="block w-fit"
              >
                <Button>Edit</Button>
              </Link>
            ) : null}
          </SectionHeader>

          <Card className="md:py-8">
            <Article>
              <MarkdownViewer preview={!!previewCommunity}>
                {community?.about}
              </MarkdownViewer>
            </Article>
          </Card>
        </>
      ) : null}
    </CommunityLayout>
  )
}
