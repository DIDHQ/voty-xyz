export type DID<S extends 'bit' | 'eth' = string> = `${string}.${S}`

export type ProposerLibertyFunction<T> = (...args: T) => {
  coin_types: number[]
  execute: (did: DID, snapshot: bigint) => Promise<boolean> | boolean
}

export type VotingPowerFunction<T> = (...args: T) => {
  coin_types: number[]
  execute: (did: DID, snapshot: bigint) => Promise<number> | number
}
