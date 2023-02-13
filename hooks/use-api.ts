import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { DataType } from '../src/constants'
import { Authorized, Community, Proposal, Option, Vote } from '../src/schemas'
import { Turnout } from '../src/types'
import { fetchJson } from '../src/utils/fetcher'

export function useCommunity(entry?: string) {
  return useSWR(
    entry ? ['community', entry] : null,
    async () => {
      const { community } = await fetchJson<{
        community: string
      }>(`/api/entry?did=${entry}`)
      const { data } = await fetchJson<{
        data: Authorized<Community> & { permalink: string }
      }>(`/api/retrieve?type=${DataType.COMMUNITY}&permalink=${community}`)
      return data
    },
    { revalidateOnFocus: false },
  )
}

export function useGroup(community?: Community, group?: string) {
  return useMemo(
    () => community?.groups?.find((g) => g.extension.id === group),
    [community?.groups, group],
  )
}

export function useProposal(proposal?: string) {
  return useSWR(
    proposal ? ['proposal', proposal] : null,
    async () => {
      const { data } = await fetchJson<{
        data: Authorized<Proposal> & { permalink: string }
      }>(`/api/retrieve?type=${DataType.PROPOSAL}&permalink=${proposal}`)
      return data
    },
    { revalidateOnFocus: false },
  )
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

export function useTurnout(proposal?: string) {
  return useSWR(
    proposal ? ['turnout', proposal] : null,
    async () => fetchJson<Turnout>(`/api/turnout?proposal=${proposal}`),
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
