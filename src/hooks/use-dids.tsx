import { useQuery } from '@tanstack/react-query'

import { Account, Snapshots } from '../utils/types'
import { commonCoinTypes } from '../utils/constants'

export default function useDids(account?: Account, snapshots?: Snapshots) {
  return useQuery(
    ['dids', account, snapshots],
    async () => {
      const snapshot = snapshots?.[commonCoinTypes.CKB]
      if (snapshot) {
        const { snapshotAddressAccounts } = await import(
          '../utils/sdks/dotbit/snapshot'
        )
        return snapshotAddressAccounts(
          account!.coinType,
          account!.address,
          snapshot,
        )
      }
      const { getAccountList } = await import('../utils/sdks/dotbit/indexer')
      return getAccountList(account!.coinType, account!.address)
    },
    { enabled: !!account, refetchOnWindowFocus: !snapshots },
  )
}
