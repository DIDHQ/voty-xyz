import { common_coin_types } from '../constants'
import { DID, DidResolver } from '../functions/types'
import { resolve_bit } from './bit'
import { resolve_eth } from './eth'

export const required_coin_types_of_did_resolver = [
  common_coin_types.ETH,
  common_coin_types.CKB,
]

export const resolve_did: DidResolver = async (did, snapshots) => {
  if (did_suffix_is(did, 'bit')) {
    return resolve_bit(did, snapshots)
  }
  if (did_suffix_is(did, 'eth')) {
    return resolve_eth(did, snapshots)
  }
  throw new Error(`unsupported did: ${did}`)
}

export function did_suffix_is<S extends 'bit' | 'eth'>(
  did: string,
  suffix: S,
): did is DID<S> {
  return did.endsWith(`.${suffix}`)
}
