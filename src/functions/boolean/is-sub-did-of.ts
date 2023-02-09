import { BooleanFunction } from '../types'

export const is_sub_did_of: BooleanFunction<[string[]]> = (did_list) => {
  const set = new Set(did_list)

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      const indexOfFirstDot = did.indexOf('.')
      return set.has(did.substring(indexOfFirstDot + 1))
    },
  }
}
