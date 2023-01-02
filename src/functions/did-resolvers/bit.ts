import { createInstance } from 'dotbit'
import invariant from 'tiny-invariant'
import { DidResolver } from '../types'

const dotbit = createInstance()

export const resolve_bit: DidResolver<'bit'> = async (
  did,
  snapshots, // TODO: use snapshots
) => {
  const manager = await dotbit.account(did).manager()
  invariant(manager.coin_type !== undefined)
  return {
    coin_type: parseInt(manager.coin_type),
    address: manager.key,
  }
}
