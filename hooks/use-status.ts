import useSWR from 'swr'

import { arweave } from '../src/arweave'
import { Status } from '../src/types'

export default function useStatus(id?: string) {
  return useSWR<Status>(id ? ['status', id] : null, async () => {
    const status = await arweave.transactions.getStatus(
      id!.replace(/^ar:\/\//, ''),
    )
    if (status.confirmed?.block_indep_hash) {
      const block = await arweave.blocks.get(status.confirmed.block_indep_hash)
      return { timestamp: block.timestamp }
    }
    return {}
  })
}
