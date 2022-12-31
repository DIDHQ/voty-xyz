import { VotingPowerFunction } from '../types'

export const whitelist: VotingPowerFunction<[string]> = async (csv) => {
  return async (did, snapshot) => {
    return 1
  }
}
