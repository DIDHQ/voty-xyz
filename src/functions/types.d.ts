export type DID<S extends 'bit' | 'eth' = string> = `${string}.${S}`

export type ProposerLibertyFunction<T> = (
  ...args: T
) => Promise<(did: DID, snapshot: bigint) => Promise<boolean>>

export type VotingPowerFunction<T> = (
  ...args: T
) => Promise<(did: DID, snapshot: bigint) => Promise<number>>
