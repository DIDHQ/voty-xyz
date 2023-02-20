import { StaticJsonRpcProvider } from '@ethersproject/providers'
import CKB from '@nervosnetwork/ckb-sdk-core'
import invariant from 'tiny-invariant'

import { chainIdToRpc, coinTypeToChainId, commonCoinTypes } from './constants'
import { fetchJson } from './fetcher'
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

export async function getSnapshotTimestamp(
  coinType: number,
  snapshot: string,
): Promise<Date> {
  if (coinType === commonCoinTypes.AR) {
    const block = await fetchJson<{ timestamp: number }>(
      `https://arseed.web3infra.dev/block/height/${snapshot}`,
    )
    return new Date(block.timestamp * 1000)
  }
  if (coinType === commonCoinTypes.CKB) {
    const block = await ckb.rpc.getBlockByNumber(BigInt(snapshot))
    return new Date(parseInt(block.header.timestamp))
  }
  throw new Error(`current snapshot coin type unsupported: ${coinType}`)
}
