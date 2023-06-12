import { useEffect } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '@/src/hooks/use-router-query'
import { permalink2Id } from '@/src/utils/permalink'

export default function GrantProposalPage() {
  const query = useRouterQuery<['grant_proposal_permalink']>()
  const router = useRouter()
  useEffect(() => {
    if (query.grant_proposal_permalink) {
      router.push(
        `/grant-proposal/${permalink2Id(query.grant_proposal_permalink)}`,
      )
    }
  }, [query.grant_proposal_permalink, router])

  return null
}
