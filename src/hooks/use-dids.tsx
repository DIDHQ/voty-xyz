import { CoinType, createInstance } from 'dotbit'
import useSWR from 'swr'

import { Account } from '../utils/types'

export default function useDids(account?: Account) {
  return useSWR(
    account ? ['dids', account.address, account.coinType] : null,
    async () => {
      const dotbit = createInstance()
      const accounts = await dotbit.accountsOfOwner({
        key: account!.address,
        coin_type: account!.coinType.toString() as CoinType,
      })
      return accounts.map(({ account }) => account)
    },
    { revalidateOnFocus: false },
  )
}
