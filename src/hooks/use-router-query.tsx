import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { id2Permalink } from '../utils/permalink'

export default function useRouterQuery<S extends string[] = []>() {
  const router = useRouter()
  return useMemo(
    () =>
      ({
        ...router.query,
        proposal:
          typeof router.query.proposal === 'string' && router.query.proposal
            ? id2Permalink(router.query.proposal)
            : undefined,
        option:
          typeof router.query.option === 'string' && router.query.option
            ? id2Permalink(router.query.option)
            : undefined,
      } as Partial<{
        [key in S[number]]: string
      }>),
    [router],
  )
}
