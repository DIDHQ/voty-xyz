import { Author } from '../schemas'
import { DID } from '../types'
import { bitChecker } from './bit'
import { ethChecker } from './eth'

export async function checkDidAuthor({
  did,
  coin_type,
  snapshot,
  proof,
}: Author): Promise<boolean> {
  if (didSuffixIs(did, 'bit')) {
    return bitChecker(did).check(coin_type, snapshot, proof)
  }
  if (didSuffixIs(did, 'eth')) {
    return ethChecker(did).check(coin_type, snapshot, proof)
  }
  throw new Error(`unsupported did: ${did}`)
}

export function requiredCoinTypeOfDidChecker(did: string): number {
  if (didSuffixIs(did, 'bit')) {
    return bitChecker(did).requiredCoinType
  }
  if (didSuffixIs(did, 'eth')) {
    return ethChecker(did).requiredCoinType
  }
  throw new Error(`unsupported did: ${did}`)
}

export function didSuffixIs<S extends 'bit' | 'eth'>(
  did: string,
  suffix: S,
): did is DID<S> {
  return did.endsWith(`.${suffix}`)
}
