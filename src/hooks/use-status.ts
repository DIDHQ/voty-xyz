import { useQuery } from '@tanstack/react-query'

import { commonCoinTypes } from '../utils/constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../utils/snapshot'
import { Status } from '../utils/types'

export default function useStatus(permalink?: string) {
  return useQuery<Status>(
    ['status', permalink],
    async () => {
      try {
        const snapshot = await getPermalinkSnapshot(permalink!)
        const timestamp = await getSnapshotTimestamp(
          commonCoinTypes.AR,
          snapshot,
        )
        return { timestamp }
      } catch {
        return { timestamp: undefined }
      }
    },
    { enabled: !!permalink, retry: false },
  )
}
