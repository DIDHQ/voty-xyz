import {
  arweaveHost,
  coinTypeToChainId,
  commonCoinTypes,
  isTestnet,
} from './constants'
import { fetchJson, postJson } from './fetcher'
import { permalink2Id } from './permalink'

const ckb = isTestnet
  ? 'https://test-node-api.did.id/node'
  : 'https://node-api.did.id/node'

export async function getCurrentSnapshot(coinType: number): Promise<string> {
  if (coinType === commonCoinTypes.CKB) {
    const { result } = await fetchJson<{ result: string }>(
      ckb,
      postJson({
        id: 1,
        jsonrpc: '2.0',
        method: 'get_tip_block_number',
        params: [],
      }),
    )
    return parseInt(result).toString()
  }
  if (!coinTypeToChainId[coinType]) {
    throw new Error('no client')
  }
  const { clients } = await import('./sdks/ethers')
  const client = clients[coinType]!
  const blockNumber = await client.getBlockNumber()
  return BigInt(blockNumber).toString()
}

export async function getSnapshotTimestamp(
  coinType: number,
  snapshot: string,
): Promise<Date> {
  if (coinType === commonCoinTypes.AR) {
    const block = await fetchJson<{ timestamp: number }>(
      `https://${arweaveHost}/block/height/${snapshot}`,
    )
    return new Date(block.timestamp * 1000)
  }
  if (coinType === commonCoinTypes.CKB) {
    const { result } = await fetchJson<{
      result: {
        header: {
          timestamp: string
        }
      }
    }>(
      ckb,
      postJson({
        id: 1,
        jsonrpc: '2.0',
        method: 'get_block_by_number',
        params: [`0x${BigInt(snapshot).toString(16)}`],
      }),
    )
    return new Date(parseInt(result.header.timestamp))
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
  }>(`https://${arweaveHost}/tx/${permalink2Id(permalink)}/status`)
  return status.block_height.toString()
}
