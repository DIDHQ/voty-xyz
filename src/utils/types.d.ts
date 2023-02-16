import type { Author } from './schemas'

export type DID<S extends 'bit' | 'eth' = string> = `${string}.${S}`

export type Snapshots = { [coinType: number]: string }

export type DidChecker<S extends 'bit' | 'eth' = string> = (did: DID<S>) => {
  requiredCoinType: number
  check: (
    coinType: number,
    snapshot: string,
    proof: Author['proof'],
  ) => Promise<boolean>
}

export type BooleanFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: string, snapshots: Snapshots) => Promise<boolean> | boolean
}

export type NumberFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: string, snapshots: Snapshots) => Promise<number> | number
}

export type Account = {
  coinType: number
  address: string
}

export type Status = {
  timestamp?: number
}
