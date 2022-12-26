import { CoinType } from 'dotbit'
import { useMemo } from 'react'

// TODO: remove mock values
export default function useWallet() {
  return useMemo(
    () => ({
      address: '0x1d643fac9a463c9d544506006a6348c234da485f',
      coinType: CoinType.ETH,
      async sign(message: string) {
        console.log('sign', message)
      },
    }),
    [],
  )
}
