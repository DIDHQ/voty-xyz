import { DID, Snapshots } from '../types'

export type BooleanFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: DID, snapshots: Snapshots) => Promise<boolean> | boolean
}

export type NumberFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: DID, snapshots: Snapshots) => Promise<number> | number
}
