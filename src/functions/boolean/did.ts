import { BooleanFunction } from '../types'

export const did: BooleanFunction<[string[]]> = (did_list) => {
  const set = new Set(did_list)

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return set.has(did)
    },
  }
}
