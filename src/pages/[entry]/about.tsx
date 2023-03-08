import { useMemo } from 'react'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'

import CommunityLayout from '../../components/layouts/community'
import Article from '../../components/basic/article'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import useWallet from '../../hooks/use-wallet'
import useDids from '../../hooks/use-dids'
import Button from '../../components/basic/button'
import useRouterQuery from '../../hooks/use-router-query'

export default function CommunityAboutPage() {
  const query = useRouterQuery<['entry']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(query.entry && dids?.includes(query.entry)),
    [dids, query.entry],
  )

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      {isAdmin ? (
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
      <Article className="w-full pt-6">{community?.extension?.about}</Article>
    </CommunityLayout>
  )
}
