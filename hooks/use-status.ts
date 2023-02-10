import useSWR from 'swr'

import { getArweaveTimestamp } from '../src/arweave'
import { Status } from '../src/types'

export default function useStatus(permalink?: string) {
  return useSWR<Status>(permalink ? ['status', permalink] : null, async () => {
    const timestamp = await getArweaveTimestamp(permalink!)
    return { timestamp }
  })
}
