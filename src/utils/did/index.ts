import { Authorship } from '../schemas/basic/authorship'
import { Proof } from '../schemas/basic/proof'
import { DID } from '../types'
import { bitChecker } from './bit'

export async function checkDidAuthorshipProof(
  { author, coin_type, snapshot }: Authorship,
  proof: Proof,
): Promise<boolean> {
  if (didSuffixIs(author, 'bit')) {
    return bitChecker(author).check(coin_type, snapshot, proof)
  }
  throw new Error(`unsupported did: ${author}`)
}

export function requiredCoinTypeOfDidChecker(did: string): number {
  if (didSuffixIs(did, 'bit')) {
    return bitChecker(did).requiredCoinType
  }
  throw new Error(`unsupported did: ${did}`)
}

export function didSuffixIs<S extends 'bit'>(
  did: string,
  suffix: S,
): did is DID<S> {
  return did.endsWith(`.${suffix}`)
}
