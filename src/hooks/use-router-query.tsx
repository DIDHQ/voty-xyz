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
        proposal_permalink:
          typeof router.query.proposal_permalink === 'string' &&
          router.query.proposal_permalink &&
          router.query.proposal_permalink !== previewPermalink
            ? id2Permalink(router.query.proposal_permalink)
            : undefined,
      } as Partial<{
        [key in S[number]]: string
      }>),
    [router],
  )
}
