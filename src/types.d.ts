export type DID<S extends 'bit' | 'eth' = string> = `${string}.${S}`

export type DidResolver<S extends 'bit' | 'eth' = string> = (
  did: DID<S> | string,
  snapshots: Snapshots,
) => Promise<SignatureUnit>

export type Snapshots = { [coinType: number]: bigint }

export type SignatureUnit = {
  coinType: number
  address: string
}
