import { DID, Snapshots } from '../types'
import { resolve_bit } from './bit'
import { resolve_eth } from './eth'

export async function resolve_did(
  did: DID,
  snapshots: Snapshots,
): Promise<{ coin_type: number; address: string }> {
  if (did.endsWith('.bit')) {
    return resolve_bit(did as DID<'bit'>, snapshots)
  }
  if (did.endsWith('.eth')) {
    return resolve_eth(did as DID<'eth'>, snapshots)
  }
  throw new Error(`unsupported did: ${did}`)
}
