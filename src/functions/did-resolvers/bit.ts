import { createInstance } from 'dotbit'
import invariant from 'tiny-invariant'
import { DID, Snapshots } from '../types'

const dotbit = createInstance()

export async function resolve_bit(
  did: DID<'bit'>,
  snapshots: Snapshots, // TODO: use snapshots
): Promise<{ coin_type: number; address: string }> {
  const manager = await dotbit.account(did).manager()
  invariant(manager.coin_type !== undefined)
  return {
    coin_type: parseInt(manager.coin_type),
    address: manager.key,
  }
}
