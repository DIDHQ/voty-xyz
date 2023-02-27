import { useQuery } from '@tanstack/react-query'

import { Account, Snapshots } from '../utils/types'
import { snapshotAddressAccounts } from '../utils/sdks/dotbit/snapshot'
import { commonCoinTypes } from '../utils/constants'
import { getAccountList } from '../utils/sdks/dotbit/indexer'

export default function useDids(account?: Account, snapshots?: Snapshots) {
  return useQuery(
    ['dids', account, snapshots],
    async () => {
      const snapshot = snapshots?.[commonCoinTypes.CKB]
      if (snapshot) {
        return snapshotAddressAccounts(
          account!.coinType,
          account?.address!,
          snapshot,
        )
      }
      return getAccountList(account!.coinType, account?.address!)
    },
    { enabled: !!account, refetchOnWindowFocus: false },
  )
}
