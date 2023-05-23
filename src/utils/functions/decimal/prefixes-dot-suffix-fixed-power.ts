import { Decimal } from 'decimal.js'

import { DecimalFunction } from '../../types'

export const prefixes_dot_suffix_fixed_power: DecimalFunction<
  [string, string[], string]
> = (suffix, prefixes, power) => {
  const set = new Set(prefixes.map((prefix) => `${prefix}.${suffix}`))

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return new Decimal(
        (set.size ? set.has(did) : did.endsWith(`.${suffix}`)) ? power : 0,
      )
    },
  }
}
