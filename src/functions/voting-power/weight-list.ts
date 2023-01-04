import { VotingPowerFunction } from '../types'

export const weight_list: VotingPowerFunction<[[string, number][]]> = (
  list,
) => {
  const map = new Map(list)

  return {
    requiredCoinTypes: [],
    execute: (did) => {
      return map.get(did) || 0
    },
  }
}
