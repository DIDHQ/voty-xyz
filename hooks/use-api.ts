import { Counting } from '@prisma/client'
import { useCallback } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { DataType } from '../src/constants'
import { Authorized, Community, Proposal, Option, Vote } from '../src/schemas'
import { fetchJson } from '../src/utils/fetcher'

export function useCounting(proposal?: string) {
  return useSWR(
    proposal ? ['counting', proposal] : null,
    async () =>
      fetchJson<{
        counting: { [choice: string]: Counting }
        power: number
      }>(`/api/counting?proposal=${proposal}`),
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

export function useRetrieve<T extends DataType>(type: T, uri?: string) {
  return useSWR(
    uri ? ['retrieve', uri] : null,
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
      }>(`/api/retrieve?type=${type}&uri=${uri}`)
      return data
    },
    { revalidateOnFocus: false },
  )
}

export function useUpload<T extends Authorized<Community | Proposal | Vote>>() {
  return useCallback(async (json: T) => {
    const textEncoder = new TextEncoder()
    const body = textEncoder.encode(JSON.stringify(json))
    const { uri } = await fetchJson<{ uri: string }>('/api/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    })
    return uri
  }, [])
}

export function useImport(uri?: string) {
  return useCallback(async () => {
    if (!uri) {
      return
    }
    await fetchJson('/api/import', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uri }),
    })
  }, [uri])
}

export function useListCommunities() {
  return useSWRInfinite<{
    data: (Authorized<Community> & { uri: string })[]
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
    data: (Authorized<Proposal> & { uri: string })[]
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
    data: (Authorized<Option> & { uri: string })[]
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
    data: (Authorized<Vote> & { uri: string })[]
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
