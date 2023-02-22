import Decimal from 'decimal.js'

import { NumberFunction } from '../../types'

export const prefixes_dot_suffix_fixed_power: NumberFunction<
  [string, string[], Decimal]
> = (suffix, prefixes, power) => {
  const set = new Set(prefixes.map((prefix) => `${prefix}.${suffix}`))

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return (set.size ? set.has(did) : did.endsWith(`.${suffix}`))
        ? power
        : new Decimal(0)
    },
  }
}
