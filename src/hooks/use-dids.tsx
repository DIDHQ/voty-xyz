import { CoinType, createInstance } from 'dotbit'
import { useQuery } from '@tanstack/react-query'

import { Account } from '../utils/types'

export default function useDids(account?: Account) {
  return useQuery(
    ['dids', account?.address, account?.coinType],
    async () => {
      const dotbit = createInstance()
      const accounts = await dotbit.accountsOfOwner({
        key: account!.address,
        coin_type: account!.coinType.toString() as CoinType,
      })
      return accounts.map(({ account }) => account)
    },
    { enabled: !!account, refetchOnWindowFocus: false },
  )
}
