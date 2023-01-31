import { useCallback } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { DataType } from '../src/constants'
import { Authorized, Community, Proposal, Vote } from '../src/schemas'
import { fetchJson } from '../src/utils/fetcher'

export function useCommunity(uri?: string) {
  return useSWR(uri ? ['community', uri] : null, async () => {
    const { data } = await fetchJson<{ data: Authorized<Community> }>(
      `/api/retrieve?type=${DataType.COMMUNITY}&uri=${uri}`,
    )
    return data
  })
}

export function useProposal(uri?: string) {
  return useSWR(uri ? ['proposal', uri] : null, async () => {
    const { data } = await fetchJson<{ data: Authorized<Proposal> }>(
      `/api/retrieve?type=${DataType.PROPOSAL}&uri=${uri}`,
    )
    return data
  })
}

export function useVote(uri?: string) {
  return useSWR(uri ? ['vote', uri] : null, async () => {
    const { data } = await fetchJson<{ data: Authorized<Vote> }>(
      `/api/retrieve?type=${DataType.VOTE}&uri=${uri}`,
    )
    return data
  })
}

export function useImportCommunity(uri: string) {
  return useCallback(async () => {
    await fetchJson('/api/import/community', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uri }),
    })
  }, [uri])
}

export function useImportProposal(uri: string) {
  return useCallback(async () => {
    await fetchJson('/api/import/proposal', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uri }),
    })
  }, [uri])
}

export function useImportVote(uri: string) {
  return useCallback(async () => {
    await fetchJson('/api/import/vote', {
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
