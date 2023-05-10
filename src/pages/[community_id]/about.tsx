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
import Markdown from '../../components/basic/markdown'
import { previewCommunityAtom } from '../../utils/atoms'

export default function CommunityAboutPage() {
  const query = useRouterQuery<['community_id']>()
  const { data, isLoading } = trpc.community.getById.useQuery(
    { id: query.community_id },
    { enabled: !!query.community_id },
  )
  const isManager = useIsManager(query.community_id)
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const community = previewCommunity || data

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      {community?.about ? (
        <>
          <h3 className="mt-6 text-lg font-medium text-gray-900 sm:mt-8">
            Description
          </h3>
          <Article className="w-full pt-6">
            <Markdown>{community?.about}</Markdown>
          </Article>
        </>
      ) : null}
      {community?.how_to_join ? (
        <>
          <h3
            id="how-to-join"
            className="mt-6 text-lg font-medium text-gray-900 sm:mt-8"
          >
            How to join
          </h3>
          <Article className="w-full pt-6">
            <Markdown>{community?.how_to_join}</Markdown>
          </Article>
        </>
      ) : null}
      {isManager && !previewCommunity ? (
        <Link
          href={`/${query.community_id}/settings`}
          className="mt-6 block w-fit sm:mt-8"
        >
          <Button icon={PencilIcon}>Edit</Button>
        </Link>
      ) : null}
    </CommunityLayout>
  )
}
