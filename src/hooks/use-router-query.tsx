import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { id2Permalink } from '../utils/permalink'
import { previewPermalink } from '../utils/constants'

export default function useRouterQuery<S extends string[] = []>() {
  const router = useRouter()
  return useMemo(
    () =>
      ({
        ...router.query,
        group_proposal_permalink:
          typeof router.query.group_proposal_permalink === 'string' &&
          router.query.group_proposal_permalink &&
          router.query.group_proposal_permalink !== previewPermalink
            ? id2Permalink(router.query.group_proposal_permalink)
            : undefined,
      } as Partial<{
        [key in S[number]]: string
      }>),
    [router],
  )
}
