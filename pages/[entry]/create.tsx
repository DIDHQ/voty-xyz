import { useMemo } from 'react'
import { nanoid } from 'nanoid'

import useRouterQuery from '../../hooks/use-router-query'
import GroupForm from '../../components/group-form'
import { useCommunity } from '../../hooks/use-api'
import CommunityLayout from '../../components/layouts/community'

export default function CreateGroupPage() {
  const [query] = useRouterQuery<['entry']>()
  const { data: community } = useCommunity(query.entry)
  const id = useMemo(() => nanoid(), [])

  return (
    <CommunityLayout>
      {query.entry && community ? (
        <GroupForm
          entry={query.entry}
          community={community}
          group={id}
          className="pl-6"
        />
      ) : null}
    </CommunityLayout>
  )
}
