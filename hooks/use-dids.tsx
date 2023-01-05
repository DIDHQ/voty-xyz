import { CoinType, createInstance } from 'dotbit'
import useSWR from 'swr'
import { SignatureUnit } from '../src/types'

export default function useDids(signatureUnit?: SignatureUnit) {
  return useSWR(
    signatureUnit
      ? ['accounts', signatureUnit.address, signatureUnit.coinType]
      : null,
    async () => {
      const dotbit = createInstance()
      const accounts = await dotbit.accountsOfOwner({
        key: signatureUnit!.address,
        coin_type: signatureUnit!.coinType.toString() as CoinType,
      })
      return accounts.map(({ account }) => account)
    },
    { revalidateOnFocus: false },
  )
}
