import { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'

import useRouterQuery from '../../hooks/use-router-query'
import GroupForm from '../../components/group-form'
import { useEntry } from '../../hooks/use-api'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import useDidIsMatch from '../../hooks/use-did-is-match'

export default function CreateGroupPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const { data: community, mutate } = useEntry(query.entry)
  const { data: isAdmin } = useDidIsMatch(query.entry, account)
  const group = useMemo(() => nanoid(), [])
  const handleSuccess = useCallback(() => {
    mutate()
    router.push(`/${query.entry}/${group}`)
  }, [mutate, router, query.entry, group])

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
