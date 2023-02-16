import { BitNetwork, createInstance, DefaultConfig } from 'dotbit'
import { getAddress } from 'ethers/lib/utils.js'
import invariant from 'tiny-invariant'

import { coinTypeToChainId, commonCoinTypes } from '../constants'
import { isTestnet } from '../testnet'
import { DidResolver } from '../types'

const dotbit = createInstance(
  DefaultConfig[isTestnet ? BitNetwork.testnet : BitNetwork.mainnet],
)

export const bitResolver: DidResolver<'bit'> = {
  requiredCoinTypes: [commonCoinTypes.CKB],
  async resolve(
    did,
    snapshots, // TODO: use snapshots
  ) {
    const manager = await dotbit.account(did).manager()
    invariant(manager.coin_type !== undefined)
    return {
      coinType: parseInt(manager.coin_type),
      address:
        coinTypeToChainId[manager.coin_type] === undefined
          ? manager.key
          : getAddress(manager.key),
    }
  },
}
