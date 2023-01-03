import { StaticJsonRpcProvider } from '@ethersproject/providers'
import invariant from 'tiny-invariant'
import { chainIdToRpc, coinTypeToChainId } from './constants'

export async function getCurrentSnapshot(coinType: number) {
  const chainId = coinTypeToChainId[coinType]
  invariant(
    chainId !== undefined,
    `current snapshot coin type unsupported: ${coinType}`,
  )
  const rpc = chainIdToRpc[chainId]
  invariant(rpc, `current snapshot chain rpc not found: ${chainId}`)
  const provider = new StaticJsonRpcProvider(rpc, chainId)
  const blockNumber = await provider.getBlockNumber()
  return BigInt(blockNumber)
}
