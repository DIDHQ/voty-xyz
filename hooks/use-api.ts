import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { DataType } from '../src/constants'
import { Authorized, Community, Proposal } from '../src/schemas'
import { fetchJson } from '../src/utils/fetcher'

export function useList<T>(
  type: DataType,
  where: [string, string | undefined][] = [],
) {
  return useSWR(['list', type, where], async () => {
    const { data } = await fetchJson<{
      data: ({ data: T } & { id: string })[]
    }>(
      `/api/list?${new URLSearchParams([
        ['type', type],
        ...(where.filter(([_key, value]) => value) as [string, string][]),
      ]).toString()}`,
    )
    return data.map((item) => ({ ...item.data, id: item.id }))
  })
}

export function useListCommunities() {
  return useSWRInfinite<{
    data: (Authorized<Community> & { id: string })[]
    next?: string
  }>(
    (_pageIndex, previousPageData) => [previousPageData?.next],
    ([next]) => {
      return fetchJson(`/api/list/communities?next=${next || ''}`)
    },
  )
}

export function useListProposals(entry?: string, group?: string) {
  return useSWRInfinite<{
    data: (Authorized<Proposal> & { id: string })[]
    next?: string
  }>(
    (_pageIndex, previousPageData) =>
      entry ? [entry, group, previousPageData?.next] : null,
    ([entry, group, next]) => {
      return fetchJson(
        `/api/list/proposals?entry=${entry}&group=${group || ''}&next=${
          next || ''
        }`,
      )
    },
  )
}
