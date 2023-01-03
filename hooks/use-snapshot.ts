import useSWR from 'swr'
import { getCurrentSnapshot } from '../src/snapshot'

export function useCurrentSnapshot(coinType?: number) {
  return useSWR(
    coinType === undefined ? null : ['current snapshot', coinType],
    () => {
      return getCurrentSnapshot(coinType!)
    },
  )
}
