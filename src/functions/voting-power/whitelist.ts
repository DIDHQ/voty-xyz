import { VotingPowerFunction } from '../types'

export const whitelist: VotingPowerFunction<[[string, number][]]> = async (
  list,
) => {
  const map = new Map(list)

  return async (did) => {
    return map.get(did) || 0
  }
}
