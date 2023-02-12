import { useCallback } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { DataType } from '../src/constants'
import { Authorized, Community, Proposal, Option, Vote } from '../src/schemas'
import { Turnout } from '../src/types'
import { fetchJson } from '../src/utils/fetcher'

export function useTurnout(proposal?: string) {
  return useSWR(
    proposal ? ['turnout', proposal] : null,
    async () => fetchJson<Turnout>(`/api/turnout?proposal=${proposal}`),
    { revalidateOnFocus: false },
  )
}

export function useEntryConfig(did?: string) {
  return useSWR(
    did ? ['entryConfig', did] : null,
    async () =>
      fetchJson<{
        community: string
      }>(`/api/entry?did=${did}`),
    { revalidateOnFocus: false },
  )
}

export function useRetrieve<T extends DataType>(type: T, permalink?: string) {
  return useSWR(
    permalink ? ['retrieve', permalink] : null,
    async () => {
      const { data } = await fetchJson<{
        data: Authorized<
          T extends DataType.COMMUNITY
            ? Community
            : T extends DataType.PROPOSAL
            ? Proposal
            : T extends DataType.OPTION
            ? Option
            : T extends DataType.VOTE
            ? Vote
            : never
        >
      }>(`/api/retrieve?type=${type}&permalink=${permalink}`)
      return data
    },
    { revalidateOnFocus: false },
  )
}

export function useUpload<
  T extends Authorized<Community | Proposal | Option | Vote>,
>() {
  return useCallback(async (document: T) => {
    const textEncoder = new TextEncoder()
    const body = textEncoder.encode(JSON.stringify(document))
    const { permalink } = await fetchJson<{ permalink: string }>(
      '/api/upload',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      },
    )
    return permalink
  }, [])
}

export function useListCommunities() {
  return useSWRInfinite<{
    data: (Authorized<Community> & { permalink: string })[]
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
    data: (Authorized<Proposal> & { permalink: string })[]
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

export function useListOptions(proposal?: string) {
  return useSWRInfinite<{
    data: (Authorized<Option> & { permalink: string })[]
    next?: string
  }>(
    (_pageIndex, previousPageData) =>
      proposal ? [proposal, previousPageData?.next] : null,
    ([proposal, next]) => {
      return fetchJson(
        `/api/list/options?proposal=${proposal}&next=${next || ''}`,
      )
    },
  )
}

export function useListVotes(proposal?: string) {
  return useSWRInfinite<{
    data: (Authorized<Vote> & { permalink: string })[]
    next?: string
  }>(
    (_pageIndex, previousPageData) =>
      proposal ? [proposal, previousPageData?.next] : null,
    ([proposal, next]) => {
      return fetchJson(
        `/api/list/votes?proposal=${proposal}&next=${next || ''}`,
      )
    },
  )
}
