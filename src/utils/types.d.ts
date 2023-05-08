import Decimal from 'decimal.js'

import type { Authorship } from './schemas'

export type DID<S extends 'bit' = string> = `${string}.${S}`

export type Snapshots = { [coinType: number]: string }

export type DidChecker<S extends 'bit' = string> = (did: DID<S>) => {
  requiredCoinType: number
  check: (
    coinType: number,
    snapshot: string,
    proof: Authorship['proof'],
  ) => Promise<boolean>
}

export type BooleanFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: string, snapshots: Snapshots) => Promise<boolean> | boolean
}

export type DecimalFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: string, snapshots: Snapshots) => Promise<Decimal> | Decimal
}

export type Account = {
  coinType: number
  address: string
}

export type Status = {
  timestamp?: Date
}

export type Preview = {
  from: string
  to: string
  template: string
  author: string
}

export type PreviewPermalink = 'preview'
