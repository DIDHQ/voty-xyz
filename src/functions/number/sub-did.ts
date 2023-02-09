import { NumberFunction } from '../types'

export const sub_did: NumberFunction<[number, string[]]> = (
  power,
  did_list,
) => {
  const set = new Set(did_list)

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      const indexOfFirstDot = did.indexOf('.')
      return set.has(did.substring(indexOfFirstDot + 1)) ? power : 0
    },
  }
}
