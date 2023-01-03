import { StaticJsonRpcProvider } from '@ethersproject/providers'
import invariant from 'tiny-invariant'
import { chain_id_to_rpc, coin_type_to_chain_id } from './constants'

export async function getCurrentSnapshot(coinType: number) {
  const chainId = coin_type_to_chain_id[coinType]
  invariant(
    chainId !== undefined,
    `current snapshot coin type unsupported: ${coinType}`,
  )
  const rpc = chain_id_to_rpc[chainId]
  invariant(rpc, `current snapshot chain rpc not found: ${chainId}`)
  const provider = new StaticJsonRpcProvider(rpc, chainId)
  const blockNumber = await provider.getBlockNumber()
  return BigInt(blockNumber)
}
