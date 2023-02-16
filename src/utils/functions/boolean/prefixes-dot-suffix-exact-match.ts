import { BooleanFunction } from '../../types'

export const prefixes_dot_suffix_exact_match: BooleanFunction<
  [string, string[]]
> = (suffix, prefixes) => {
  const set = new Set(prefixes.map((prefix) => `${prefix}.${suffix}`))

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return set.size ? set.has(did) : did.endsWith(`.${suffix}`)
    },
  }
}
