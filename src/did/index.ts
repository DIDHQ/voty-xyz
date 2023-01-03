import { commonCoinTypes } from '../constants'
import { DID, DidResolver } from '../types'
import { resolveBit } from './bit'
import { resolveEth } from './eth'

export const requiredCoinTypesOfDidResolver = [
  commonCoinTypes.ETH,
  commonCoinTypes.CKB,
]

export const resolveDid: DidResolver = async (did, snapshots) => {
  if (didSuffixIs(did, 'bit')) {
    return resolveBit(did, snapshots)
  }
  if (didSuffixIs(did, 'eth')) {
    return resolveEth(did, snapshots)
  }
  throw new Error(`unsupported did: ${did}`)
}

export function didSuffixIs<S extends 'bit' | 'eth'>(
  did: string,
  suffix: S,
): did is DID<S> {
  return did.endsWith(`.${suffix}`)
}
