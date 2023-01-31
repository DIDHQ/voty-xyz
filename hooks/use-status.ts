import useSWR from 'swr'

import { getArweaveTimestamp } from '../src/arweave'
import { Status } from '../src/types'

export default function useStatus(uri?: string) {
  return useSWR<Status>(uri ? ['status', uri] : null, async () => {
    const timestamp = await getArweaveTimestamp(uri!)
    return { timestamp }
  })
}
