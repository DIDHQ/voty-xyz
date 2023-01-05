import produce from 'immer'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export default function useRouterQuery<S extends string[] = []>() {
  const router = useRouter()
  return useMemo(
    () =>
      [
        router.query,
        (key, value, shallow) => {
          router.push(
            produce(router, (draft) => {
              draft.query[key] = value
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
