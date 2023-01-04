import { DID, Snapshots } from '../types'

export type ProposerLibertyFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: DID, snapshots: Snapshots) => Promise<boolean> | boolean
}

export type VotingPowerFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: DID, snapshots: Snapshots) => Promise<number> | number
}
