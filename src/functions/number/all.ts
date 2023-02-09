import { NumberFunction } from '../types'

export const all: NumberFunction<[number]> = (power) => {
  return {
    requiredCoinTypes: [],
    execute: () => {
      return power
    },
  }
}
