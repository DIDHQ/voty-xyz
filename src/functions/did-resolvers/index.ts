import { common_coin_types } from '../../constants'
import { DID, DidResolver } from '../types'
import { resolve_bit } from './bit'
import { resolve_eth } from './eth'

export const required_coin_types_of_did_resolver = [
  common_coin_types.ETH,
  common_coin_types.CKB,
]

export const resolve_did: DidResolver = async (did, snapshots) => {
  if (did.endsWith('.bit')) {
    return resolve_bit(did as DID<'bit'>, snapshots)
  }
  if (did.endsWith('.eth')) {
    return resolve_eth(did as DID<'eth'>, snapshots)
  }
  throw new Error(`unsupported did: ${did}`)
}
