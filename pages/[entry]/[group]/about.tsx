import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import { useEntryConfig, useRetrieve } from '../../../hooks/use-api'
import { DataType } from '../../../src/constants'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import Markdown from '../../../components/basic/markdown'

export default function GroupAboutPage() {
  const [query] = useRouterQuery<['entry', 'group']>()
  const { data: config } = useEntryConfig(query.entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)
  const group = useMemo(
    () =>
      query.group ? community?.groups?.[parseInt(query.group)] : undefined,
    [community?.groups, query.group],
  )

  return (
    <CommunityLayout>
      <GroupLayout>
        <div className="flex w-full flex-col pt-6 pl-6">
          <article className="prose">
            <Markdown>{group?.extension?.about}</Markdown>
          </article>
        </div>
      </GroupLayout>
    </CommunityLayout>
  )
}
