import { useQuery } from '@tanstack/react-query'

import { commonCoinTypes, previewPermalink } from '../utils/constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../utils/snapshot'
import { PreviewPermalink, Status } from '../utils/types'

export default function useStatus(permalink?: string | PreviewPermalink) {
  return useQuery<Status>(
    ['status', permalink],
    async () => {
      try {
        if (permalink === previewPermalink) {
          return { timestamp: new Date() }
        }
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
    { enabled: !!permalink, refetchInterval: 60 * 1000 },
  )
}
