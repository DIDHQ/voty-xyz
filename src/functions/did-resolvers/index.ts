import { DID } from '../types'
import { resolve_bit } from './bit'
import { resolve_eth } from './eth'

export async function resolve_did(
  did: DID,
  snapshot: bigint,
): Promise<{ coin_type: number; address: string }> {
  if (did.endsWith('.bit')) {
    return resolve_bit(did as DID<'bit'>, snapshot)
  }
  if (did.endsWith('.eth')) {
    return resolve_eth(did as DID<'eth'>, snapshot)
  }
  throw new Error(`unsupported did: ${did}`)
}
