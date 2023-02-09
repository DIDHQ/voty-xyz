import { NumberFunction } from '../types'

export const did: NumberFunction<[number, string[]]> = (power, did_list) => {
  const set = new Set(did_list)

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return set.has(did) ? power : 0
    },
  }
}
