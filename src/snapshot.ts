import { StaticJsonRpcProvider } from '@ethersproject/providers'
import CKB from '@nervosnetwork/ckb-sdk-core'
import { mapKeys, mapValues } from 'lodash-es'
import invariant from 'tiny-invariant'

import { chainIdToRpc, coinTypeToChainId, commonCoinTypes } from './constants'
import { Snapshots } from './types'

export async function getCurrentSnapshot(coinType: number): Promise<bigint> {
  if (coinType === commonCoinTypes.CKB) {
    const ckb = new CKB('https://mainnet.ckb.dev/')
    const blockNumber = await ckb.rpc.getTipBlockNumber()
    return BigInt(blockNumber)
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
  return BigInt(blockNumber)
}

export function mapSnapshots(json: { [coinType: string]: string }): Snapshots {
  return mapKeys(
    mapValues(json, (value) => BigInt(value)),
    (_value, key) => parseInt(key),
  )
}
