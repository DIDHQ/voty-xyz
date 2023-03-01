import { ReactNode } from 'react'

import useRouterQuery from '../../hooks/use-router-query'
import { trpc } from '../../utils/trpc'
import CommunityNav from '../community-nav'

export default function CommunityLayout(props: { children: ReactNode }) {
  const query = useRouterQuery<['entry', 'workgroup', 'create']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )

  return community === null || query.create ? (
    <div className="w-full flex-1 sm:w-0">{props.children}</div>
  ) : (
    <>
      <div className="top-18 mt-[-1px] block w-full shrink-0 pt-6 sm:sticky sm:w-60 sm:pt-8">
        <CommunityNav />
      </div>
      <div className="w-full flex-1 sm:w-0 sm:pl-10">{props.children}</div>
    </>
  )
}
