import { BitNetwork, CoinType, createInstance, DefaultConfig } from 'dotbit'
import { useQuery } from '@tanstack/react-query'

import { Account, Snapshots } from '../utils/types'
import { isTestnet } from '../utils/testnet'
import { snapshotAddressAccounts } from '../utils/das-database'

const dotbit = createInstance(
  DefaultConfig[isTestnet ? BitNetwork.testnet : BitNetwork.mainnet],
)

export default function useDids(account?: Account, snapshots?: Snapshots) {
  return useQuery(
    ['dids', account, snapshots],
    async () => {
      const snapshot = snapshots?.[account!.coinType]
      if (snapshot === undefined) {
        const accounts = await dotbit.accountsOfOwner({
          key: account!.address,
          coin_type: account!.coinType.toString() as CoinType,
        })
        return accounts.map(({ account }) => account)
      }
      return snapshotAddressAccounts(
        account!.coinType,
        account!.address,
        snapshot,
      )
    },
    { enabled: !!account, refetchOnWindowFocus: false },
  )
}
