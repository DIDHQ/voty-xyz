import { useMemo } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { chainIdToCoinType } from '../src/constants'
import { SignatureUnit } from '../src/types'

export default function useConnectedSignatureUnit(): SignatureUnit | undefined {
  const account = useAccount()
  const network = useNetwork()

  return useMemo(
    () =>
      network.chain && account.address
        ? {
            coinType: chainIdToCoinType[network.chain.id],
            address: account.address,
          }
        : undefined,
    [account.address, network.chain],
  )
}
