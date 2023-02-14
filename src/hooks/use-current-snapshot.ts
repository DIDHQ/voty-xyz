import useSWR from 'swr'
import { getCurrentSnapshot } from '../utils/snapshot'

export default function useCurrentSnapshot(coinType?: number) {
  return useSWR(
    coinType === undefined ? null : ['current snapshot', coinType],
    () => {
      return getCurrentSnapshot(coinType!)
    },
  )
}
