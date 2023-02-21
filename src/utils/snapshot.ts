import { commonCoinTypes } from './constants'
import { fetchJson } from './fetcher'
import { permalink2Id } from './permalink'
import ckb from './sdks/ckb'
import { providers } from './sdks/ethers'

export async function getCurrentSnapshot(coinType: number): Promise<string> {
  if (coinType === commonCoinTypes.CKB) {
    const blockNumber = await ckb.rpc.getTipBlockNumber()
    return parseInt(blockNumber).toString()
  }
  const provider = providers[coinType]
  if (!provider) {
    throw new Error('no provider')
  }
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

export async function getPermalinkSnapshot(permalink: string): Promise<string> {
  if (!permalink.startsWith('ar://')) {
    throw new Error('permalink not supported')
  }
  const status = await fetchJson<{
    block_indep_hash: string
    block_height: number
    number_of_confirmations: number
  }>(`https://arseed.web3infra.dev/tx/${permalink2Id(permalink)}/status`)
  return status.block_height.toString()
}
