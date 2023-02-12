import { NumberFunction } from '../types'

export const prefixes_dot_suffix_fixed_power: NumberFunction<
  [number, string[], string]
> = (power, prefixes, suffix) => {
  const set = new Set(prefixes.map((prefix) => `${prefix}.${suffix}`))

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return (set.size ? set.has(did) : did.endsWith(`.${suffix}`)) ? power : 0
    },
  }
}
