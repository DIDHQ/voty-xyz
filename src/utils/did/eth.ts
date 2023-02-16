import { providers } from 'ethers'
import invariant from 'tiny-invariant'

import { chainIdToRpc, commonChainIds } from '../constants'
import { DidResolver } from '../types'

const provider = new providers.StaticJsonRpcProvider(
  chainIdToRpc[commonChainIds.ETH],
  1,
)

export const resolveEth: DidResolver<'eth'> = async (
  did,
  snapshots, // TODO: use snapshots
) => {
  throw new Error('not implemented yet')
  // const address = await provider.resolveName(did)
  // invariant(address)
  // return { coinType: 60, address }
}
