import useSWR from 'swr'

import { resolveDid } from '../src/did'
import { getCurrentSnapshot } from '../src/snapshot'
import { Account, Snapshots } from '../src/types'

export default function useDidIsMatch(
  did?: string,
  account?: Account,
  snapshots?: Snapshots,
) {
  return useSWR(
    did && account ? ['matchDid', did, account] : null,
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
    {
      revalidateOnFocus: false,
    },
  )
}
