import { mapValues } from 'lodash-es'
import {
  verifyMessage,
  getAddress,
  keccak256,
  http,
  createPublicClient,
} from 'viem'

import { chainIdToRpc, coinTypeToChainId } from '../constants'

export const clients = mapValues(coinTypeToChainId, (chainId) => {
  const rpc = chainId === undefined ? undefined : chainIdToRpc[chainId]
  return rpc ? createPublicClient({ transport: http(rpc) }) : undefined
})

export { verifyMessage, getAddress, keccak256 }
