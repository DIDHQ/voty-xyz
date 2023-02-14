import { useCallback } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import GroupForm from '../../../components/group-form'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import useDidIsMatch from '../../../hooks/use-did-is-match'
import useWallet from '../../../hooks/use-wallet'
import { trpc } from '../../../utils/trpc'

export default function GroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'group']>()
  const { account } = useWallet()
  const { data: community, refetch } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const { data: isAdmin } = useDidIsMatch(query.entry, account)
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}/${query.group}`)
  }, [refetch, query.entry, query.group, router])

  return (
    <CommunityLayout>
      <GroupLayout>
        {query.entry && query.group && community ? (
          <GroupForm
            community={community}
            group={query.group}
            onSuccess={handleSuccess}
            disabled={!isAdmin}
            className="pl-6"
          />
        ) : null}
      </GroupLayout>
    </CommunityLayout>
  )
}
