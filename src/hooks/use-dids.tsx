import { useQuery } from '@tanstack/react-query'

import { Account, Snapshots } from '../utils/types'
import { snapshotAddressAccounts } from '../utils/sdks/dotbit/snapshot'
import { getCurrentSnapshot } from '../utils/snapshot'
import { commonCoinTypes } from '../utils/constants'

export default function useDids(account?: Account, snapshots?: Snapshots) {
  return useQuery(
    ['dids', account, snapshots],
    async () => {
      const snapshot =
        snapshots?.[commonCoinTypes.CKB] ||
        (await getCurrentSnapshot(commonCoinTypes.CKB))
      return snapshotAddressAccounts(
        account!.coinType,
        account!.address,
        snapshot,
      )
    },
    { enabled: !!account, refetchOnWindowFocus: false },
  )
}
