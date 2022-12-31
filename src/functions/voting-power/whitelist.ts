import { VotingPowerFunction } from '../types'

export const whitelist: VotingPowerFunction<[string]> = (csv) => {
  return async (did, snapshot) => {
    return 1
  }
}
