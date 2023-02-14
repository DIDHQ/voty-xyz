import { useQuery } from '@tanstack/react-query'

import { getArweaveTimestamp } from '../utils/arweave'
import { Status } from '../utils/types'

export default function useStatus(permalink?: string) {
  return useQuery<Status>(
    ['status', permalink],
    async () => {
      const timestamp = await getArweaveTimestamp(permalink!)
      return { timestamp }
    },
    { enabled: !!permalink },
  )
}
