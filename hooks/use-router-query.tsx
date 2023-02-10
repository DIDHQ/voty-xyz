import produce from 'immer'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { id2Permalink, permalink2Id } from '../src/arweave'

export default function useRouterQuery<S extends string[] = []>() {
  const router = useRouter()
  return useMemo(
    () =>
      [
        typeof router.query.proposal === 'string' && router.query.proposal
          ? { ...router.query, proposal: id2Permalink(router.query.proposal) }
          : router.query,
        (key, value, shallow) => {
          router.push(
            produce(router, (draft) => {
              draft.query[key] =
                key === 'proposal' && value ? permalink2Id(value) : value
            }),
            undefined,
            { shallow },
          )
        },
      ] as [
        Partial<{
          [key in S[number]]: string
        }>,
        (key: S[number], value?: string, shallow?: boolean) => void,
      ],
    [router],
  )
}
