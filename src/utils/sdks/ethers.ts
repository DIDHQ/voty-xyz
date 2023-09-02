import { mapValues } from 'remeda'
import {
  verifyMessage,
  getAddress,
  keccak256,
  http,
  createPublicClient,
  PublicClient,
} from 'viem'

import { chainIdToRpc, coinTypeToChainId } from '../constants'

export const clients = mapValues(coinTypeToChainId, (chainId) => {
  const rpc = chainId === undefined ? undefined : chainIdToRpc[chainId]
  return rpc ? createPublicClient({ transport: http(rpc) }) : undefined
}) as Record<number, PublicClient | undefined>

export { verifyMessage, getAddress, keccak256 }
