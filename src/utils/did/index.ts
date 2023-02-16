import { Account, DID, Snapshots } from '../types'
import { bitResolver } from './bit'
import { ethResolver } from './eth'

export async function resolveDid(
  did: string,
  snapshots: Snapshots,
): Promise<Account> {
  if (didSuffixIs(did, 'bit')) {
    return bitResolver.resolve(did, snapshots)
  }
  if (didSuffixIs(did, 'eth')) {
    return ethResolver.resolve(did, snapshots)
  }
  throw new Error(`unsupported did: ${did}`)
}

export function requiredCoinTypesOfDidResolver(did: string) {
  if (didSuffixIs(did, 'bit')) {
    return bitResolver.requiredCoinTypes
  }
  if (didSuffixIs(did, 'eth')) {
    return ethResolver.requiredCoinTypes
  }
  throw new Error(`unsupported did: ${did}`)
}

export function didSuffixIs<S extends 'bit' | 'eth'>(
  did: string,
  suffix: S,
): did is DID<S> {
  return did.endsWith(`.${suffix}`)
}
