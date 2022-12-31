import { DID, ProposerLibertyFunction } from '../types'

export const whitelist: ProposerLibertyFunction<[string]> = (csv: string) => {
  return (did: DID, snapshot: bigint) => {
    return true
  }
}
