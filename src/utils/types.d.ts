export type DID<S extends 'bit' | 'eth' = string> = `${string}.${S}`

export type DidResolver<S extends 'bit' | 'eth' = string> = {
  requiredCoinTypes: number[]
  resolve: (did: DID<S>, snapshots: Snapshots) => Promise<Account>
}

export type Snapshots = { [coinType: number]: string }

export type Proof = `${number}:${string}`

export type Account = {
  coinType: number
  address: string
}

export type Status = {
  timestamp?: number
}
