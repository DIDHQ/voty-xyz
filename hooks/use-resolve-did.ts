import useSWR from 'swr'

import { resolveDid } from '../src/did'
import { getCurrentSnapshot } from '../src/snapshot'

export default function useResolveDid(did?: string, coinType?: number) {
  return useSWR(
    did && coinType !== undefined ? ['resolveDid', did, coinType] : null,
    async () => {
      const snapshot = await getCurrentSnapshot(coinType!)
      return resolveDid(did!, { [coinType!]: snapshot! })
    },
    { revalidateOnFocus: false },
  )
}
