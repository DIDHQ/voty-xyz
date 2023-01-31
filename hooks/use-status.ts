import useSWR from 'swr'

import { arweave, getArweaveStatus } from '../src/arweave'
import { Status } from '../src/types'

export default function useStatus(uri?: string) {
  return useSWR<Status>(uri ? ['status', uri] : null, async () => {
    const status = await getArweaveStatus(uri!)
    if (status.confirmed?.block_indep_hash) {
      const block = await arweave.blocks.get(status.confirmed.block_indep_hash)
      return { timestamp: block.timestamp }
    }
    return {}
  })
}
