import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import GroupForm from '../../../components/group-form'
import { useCommunity } from '../../../hooks/use-api'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'

export default function GroupSettingsPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: community } = useCommunity(query.entry)
  const isNewGroup = useMemo(
    () => !!query.group && !community?.groups?.[parseInt(query.group)],
    [community?.groups, query.group],
  )

  return (
    <CommunityLayout>
      <GroupLayout hideNav={isNewGroup}>
        {query.entry && query.group && community ? (
          <GroupForm
            key={query.entry + query.group}
            entry={query.entry}
            community={community}
            group={parseInt(query.group)}
            className="pl-6"
          />
        ) : null}
      </GroupLayout>
    </CommunityLayout>
  )
}
