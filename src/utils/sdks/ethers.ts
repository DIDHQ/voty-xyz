import { mapValues } from 'lodash-es'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { verifyMessage, getAddress, sha256 } from 'ethers/lib/utils.js'

import { chainIdToRpc, coinTypeToChainId } from '../constants'

export const providers = mapValues(coinTypeToChainId, (chainId) => {
  const rpc = chainIdToRpc[chainId!]
  return rpc ? new StaticJsonRpcProvider(rpc, chainId) : undefined
})

export { verifyMessage, getAddress, sha256 }
