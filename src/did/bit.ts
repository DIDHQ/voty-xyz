import { createInstance } from 'dotbit'
import { getAddress } from 'ethers/lib/utils.js'
import invariant from 'tiny-invariant'
import { coin_type_to_chain_id } from '../constants'
import { DidResolver } from '../functions/types'

const dotbit = createInstance()

export const resolve_bit: DidResolver<'bit'> = async (
  did,
  snapshots, // TODO: use snapshots
) => {
  const manager = await dotbit.account(did).manager()
  invariant(manager.coin_type !== undefined)
  return {
    coin_type: parseInt(manager.coin_type),
    address:
      coin_type_to_chain_id[manager.coin_type] === undefined
        ? manager.key
        : getAddress(manager.key),
  }
}
