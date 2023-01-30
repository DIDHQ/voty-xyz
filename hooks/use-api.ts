import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { DataType } from '../src/constants'
import { Authorized, Community, Proposal, Vote } from '../src/schemas'
import { fetchJson } from '../src/utils/fetcher'

export function useCommunity(id?: string) {
  return useSWR(id ? ['community', id] : null, async () => {
    const { data } = await fetchJson<{ data: Authorized<Community> }>(
      `/api/retrieve?type=${DataType.COMMUNITY}&id=${id}`,
    )
    return data
  })
}

export function useProposal(id?: string) {
  return useSWR(id ? ['proposal', id] : null, async () => {
    const { data } = await fetchJson<{ data: Authorized<Proposal> }>(
      `/api/retrieve?type=${DataType.PROPOSAL}&id=${id}`,
    )
    return data
  })
}

export function useVote(id?: string) {
  return useSWR(id ? ['vote', id] : null, async () => {
    const { data } = await fetchJson<{ data: Authorized<Vote> }>(
      `/api/retrieve?type=${DataType.VOTE}&id=${id}`,
    )
    return data
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

export function useListVotes(proposal?: string) {
  return useSWRInfinite<{
    data: (Authorized<Vote> & { id: string })[]
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
