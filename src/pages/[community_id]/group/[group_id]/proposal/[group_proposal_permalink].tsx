import { useEffect } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '@/src/hooks/use-router-query'
import { permalink2Id } from '@/src/utils/permalink'

export default function GroupProposalPage() {
  const query = useRouterQuery<['group_proposal_permalink']>()
  const router = useRouter()
  useEffect(() => {
    if (query.group_proposal_permalink) {
      router.push(
        `/group-proposal/${permalink2Id(query.group_proposal_permalink)}`,
      )
    }
  }, [query.group_proposal_permalink, router])

  return null
}
