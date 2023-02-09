import { BooleanFunction } from '../types'

export const all: BooleanFunction<[]> = () => {
  return {
    requiredCoinTypes: [],
    execute: () => {
      return true
    },
  }
}
