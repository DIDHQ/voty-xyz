import { ProposerLibertyFunction } from '../types'

export const whitelist: ProposerLibertyFunction<[string[]]> = (list) => {
  const set = new Set(list)

  return {
    required_coin_types: [],
    execute: (did) => {
      return set.has(did)
    },
  }
}
