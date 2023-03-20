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
import PreviewBar from '../../components/preview-bar'

export default function CommunityAboutPage() {
  const query = useRouterQuery<['entry']>()
  const { data, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const isManager = useIsManager(query.entry)
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const community = previewCommunity || data

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      {isManager && !previewCommunity ? (
        <Link
          href={`/${query.entry}/settings`}
          className="float-right mt-6 sm:mt-8"
        >
          <Button icon={PencilIcon} primary>
            Edit
          </Button>
        </Link>
      ) : null}
      <h3 className="mt-6 text-lg font-medium leading-6 text-gray-900 sm:mt-8">
        About
      </h3>
      <Article className="w-full pt-6">
        <Markdown>{community?.extension?.about}</Markdown>
      </Article>
      {previewCommunity ? <PreviewBar /> : null}
    </CommunityLayout>
  )
}
