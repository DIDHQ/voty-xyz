import { VotingPowerFunction } from '../types'

export const whitelist: VotingPowerFunction<[[string, number][]]> = (list) => {
  const map = new Map(list)

  return {
    required_coin_types: [],
    execute: (did) => {
      return map.get(did) || 0
    },
  }
}
