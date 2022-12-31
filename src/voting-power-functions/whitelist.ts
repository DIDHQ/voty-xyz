import { DID, VotingPowerFunction } from '../types'

export const whitelist: VotingPowerFunction<[string]> = (csv: string) => {
  return (did: DID, snapshot: bigint) => {
    return 1
  }
}
