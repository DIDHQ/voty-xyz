import { NumberFunction } from '../types'

export const did: NumberFunction<[string[], number]> = (did_list, power) => {
  const set = new Set(did_list)

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return set.has(did) ? power : 0
    },
  }
}
