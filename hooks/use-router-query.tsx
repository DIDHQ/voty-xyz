import produce from 'immer'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { idToURI, uriToID } from '../src/arweave'

export default function useRouterQuery<S extends string[] = []>() {
  const router = useRouter()
  return useMemo(
    () =>
      [
        typeof router.query.proposal === 'string' && router.query.proposal
          ? { ...router.query, proposal: idToURI(router.query.proposal) }
          : router.query,
        (key, value, shallow) => {
          router.push(
            produce(router, (draft) => {
              draft.query[key] =
                key === 'proposal' && value ? uriToID(value) : value
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
