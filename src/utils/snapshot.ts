import { StaticJsonRpcProvider } from '@ethersproject/providers'
import CKB from '@nervosnetwork/ckb-sdk-core'
import invariant from 'tiny-invariant'

import { chainIdToRpc, coinTypeToChainId, commonCoinTypes } from './constants'

export async function getCurrentSnapshot(coinType: number): Promise<string> {
  if (coinType === commonCoinTypes.CKB) {
    const ckb = new CKB('https://mainnet.ckb.dev/')
    const blockNumber = await ckb.rpc.getTipBlockNumber()
    return blockNumber
  }
  const chainId = coinTypeToChainId[coinType]
  invariant(
    chainId !== undefined,
    `current snapshot coin type unsupported: ${coinType}`,
  )
  const rpc = chainIdToRpc[chainId]
  invariant(rpc, `current snapshot chain rpc not found: ${chainId}`)
  const provider = new StaticJsonRpcProvider(rpc, chainId)
  const blockNumber = await provider.getBlockNumber()
  return BigInt(blockNumber).toString()
}
