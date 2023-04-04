import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

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
  const query = useRouterQuery<['entry']>()
  const router = useRouter()
  const { data, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const isManager = useIsManager(query.entry)
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const community = previewCommunity || data
  useEffect(() => {
    if (community === null) {
      router.push('/404')
    }
  }, [community, router])

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      <h3 className="mt-6 text-lg font-medium leading-6 text-gray-900 sm:mt-8">
        About
      </h3>
      {community?.extension?.description ? (
        <Article className="w-full pt-6">
          <Markdown>{community?.extension?.description}</Markdown>
        </Article>
      ) : null}
      {isManager && !previewCommunity ? (
        <Link
          href={`/${query.entry}/settings`}
          className="mt-6 block w-fit sm:mt-8"
        >
          <Button icon={PencilIcon}>Edit</Button>
        </Link>
      ) : null}
    </CommunityLayout>
  )
}
