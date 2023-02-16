import { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'

import useRouterQuery from '../../hooks/use-router-query'
import GroupForm from '../../components/group-form'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import { trpc } from '../../utils/trpc'
import useDids from '../../hooks/use-dids'

export default function CreateGroupPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const { data: community, refetch } = trpc.community.getByEntry.useQuery(
    query,
    { enabled: !!query.entry },
  )
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(query.entry && dids?.includes(query.entry)),
    [dids, query.entry],
  )
  const group = useMemo(() => nanoid(), [])
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}/${group}`)
  }, [refetch, router, query.entry, group])

  return (
    <CommunityLayout>
      {query.entry && community ? (
        <GroupForm
          community={community}
          group={group}
          onSuccess={handleSuccess}
          disabled={!isAdmin}
          className="pl-6"
        />
      ) : null}
    </CommunityLayout>
  )
}
