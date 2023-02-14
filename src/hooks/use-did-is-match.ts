import { useQuery } from '@tanstack/react-query'

import { resolveDid } from '../utils/did'
import { getCurrentSnapshot } from '../utils/snapshot'
import { Account, Snapshots } from '../utils/types'

export default function useDidIsMatch(
  did?: string,
  account?: Account,
  snapshots?: Snapshots,
) {
  return useQuery(
    ['matchDid', did, account],
    async () => {
      const resolved = await resolveDid(
        did!,
        snapshots || {
          [account!.coinType]: await getCurrentSnapshot(account!.coinType),
        },
      )
      return (
        resolved &&
        account &&
        resolved.coinType === account.coinType &&
        resolved.address === account.address
      )
    },
    { enabled: !!did && !!account, refetchOnWindowFocus: false },
  )
}
