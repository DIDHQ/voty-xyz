import { fetchJson } from './fetcher'
import { permalink2Id } from './permalink'

const host = 'arseed.web3infra.dev'

export async function getArweaveTimestamp(
  permalink: string,
): Promise<number | undefined> {
  if (!permalink.startsWith('ar://')) {
    throw new Error('permalink not supported')
  }
  const status = await fetchJson<{
    block_indep_hash: string
    block_height: number
    number_of_confirmations: number
  }>(`https://${host}/tx/${permalink2Id(permalink)}/status`)
  if (status.block_indep_hash) {
    const block = await fetchJson<{ timestamp: number }>(
      `https://${host}/block/hash/${status.block_indep_hash}`,
    )
    return block.timestamp
  }
  return undefined
}

export async function getArweaveData(
  permalink: string,
): Promise<object | undefined> {
  if (!permalink.startsWith('ar://')) {
    throw new Error('permalink not supported')
  }
  return fetchJson<object>(`https://${host}/${permalink2Id(permalink)}`)
}
