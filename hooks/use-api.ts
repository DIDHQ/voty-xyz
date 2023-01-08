import useSWR from 'swr'

import { DataType } from '../src/constants'
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
