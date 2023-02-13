import { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'

import useRouterQuery from '../../hooks/use-router-query'
import GroupForm from '../../components/group-form'
import { useCommunity } from '../../hooks/use-api'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import useDidIsMatch from '../../hooks/use-did-is-match'

export default function CreateGroupPage() {
  const router = useRouter()
  const [query] = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const { data: community } = useCommunity(query.entry)
  const { data: isAdmin } = useDidIsMatch(query.entry, account)
  const group = useMemo(() => nanoid(), [])
  const handleSuccess = useCallback(() => {
    router.push(`/${query.entry}/${group}`)
  }, [query.entry, group, router])

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
