import { NumberFunction } from '../types'

export const static_power: NumberFunction<[{ [did: string]: number }]> = (
  power_map,
) => {
  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return power_map[did] || 0
    },
  }
}
