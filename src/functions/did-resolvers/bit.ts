import { createInstance } from 'dotbit'
import invariant from 'tiny-invariant'
import { DID } from '../types'

const dotbit = createInstance()

export async function resolve_bit(
  did: DID<'bit'>,
  snapshot: bigint,
): Promise<{ coin_type: number; address: string }> {
  const manager = await dotbit.account(did).manager()
  invariant(manager.coin_type !== undefined)
  return {
    coin_type: parseInt(manager.coin_type),
    address: manager.key,
  }
}
