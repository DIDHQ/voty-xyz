import { providers } from 'ethers'
import invariant from 'tiny-invariant'

import { chainIdToRpc, commonChainIds, commonCoinTypes } from '../constants'
import { DidResolver } from '../types'

const provider = new providers.StaticJsonRpcProvider(
  chainIdToRpc[commonChainIds.ETH],
  1,
)

export const ethResolver: DidResolver<'eth'> = {
  requiredCoinTypes: [commonCoinTypes.ETH],
  async resolve(
    did,
    snapshots, // TODO: use snapshots
  ) {
    throw new Error('not implemented yet')
    // const address = await provider.resolveName(did)
    // invariant(address)
    // return { coinType: 60, address }
  },
}
