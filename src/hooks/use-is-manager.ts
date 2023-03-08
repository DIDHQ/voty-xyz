import { useMemo } from 'react'

import useDids from './use-dids'
import useWallet from './use-wallet'

export default function useIsManager(did?: string) {
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  return useMemo(() => !!(did && dids?.includes(did)), [dids, did])
}
