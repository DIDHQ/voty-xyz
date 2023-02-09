import { BooleanFunction } from '../types'

export const sub_did: BooleanFunction<[string[]]> = (did_list) => {
  const set = new Set(did_list)

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      const indexOfFirstDot = did.indexOf('.')
      return set.has(did.substring(indexOfFirstDot + 1))
    },
  }
}
