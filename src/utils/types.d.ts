export type DID<S extends 'bit' | 'eth' = string> = `${string}.${S}`

export type Snapshots = { [coinType: number]: string }

export type DidResolver<S extends 'bit' | 'eth' = string> = {
  requiredCoinTypes: number[]
  resolve: (did: DID<S>, snapshots: Snapshots) => Promise<Account>
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
