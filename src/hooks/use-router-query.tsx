import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { id2Permalink } from '../utils/arweave'

export default function useRouterQuery<S extends string[] = []>() {
  const router = useRouter()
  return useMemo(
    () =>
      (typeof router.query.proposal === 'string' && router.query.proposal
        ? { ...router.query, proposal: id2Permalink(router.query.proposal) }
        : router.query) as Partial<{
        [key in S[number]]: string
      }>,
    [router],
  )
}
