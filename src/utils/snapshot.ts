import { StaticJsonRpcProvider } from '@ethersproject/providers'
import CKB from '@nervosnetwork/ckb-sdk-core'
import invariant from 'tiny-invariant'

import { chainIdToRpc, coinTypeToChainId, commonCoinTypes } from './constants'
import { isTestnet } from './testnet'

const ckb = new CKB(
  isTestnet ? 'https://testnet.ckb.dev/' : 'https://mainnet.ckb.dev/',
)

export async function getCurrentSnapshot(coinType: number): Promise<string> {
  if (coinType === commonCoinTypes.CKB) {
    const blockNumber = await ckb.rpc.getTipBlockNumber()
    return parseInt(blockNumber).toString()
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
