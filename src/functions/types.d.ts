export type DID<S extends 'bit' | 'eth' = string> = `${string}.${S}`

export type DidResolver<S extends 'bit' | 'eth' = string> = (
  did: DID<S> | string,
  snapshots: Snapshots,
) => Promise<{ coin_type: number; address: string }>

export type ProposerLibertyFunction<T> = (...args: T) => {
  required_coin_types: number[]
  execute: (did: DID, snapshots: Snapshots) => Promise<boolean> | boolean
}

export type VotingPowerFunction<T> = (...args: T) => {
  required_coin_types: number[]
  execute: (did: DID, snapshots: Snapshots) => Promise<number> | number
}

export type Snapshots = { [coin_type: number]: bigint }
