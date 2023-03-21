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
        proposal:
          typeof router.query.proposal === 'string' &&
          router.query.proposal &&
          router.query.proposal !== previewPermalink
            ? id2Permalink(router.query.proposal)
            : undefined,
        option:
          typeof router.query.option === 'string' &&
          router.query.option &&
          router.query.option !== previewPermalink
            ? id2Permalink(router.query.option)
            : undefined,
      } as Partial<{
        [key in S[number]]: string
      }>),
    [router],
  )
}
