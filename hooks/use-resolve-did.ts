import useSWR from 'swr'
import { resolveDid } from '../src/did'
import { SignatureUnit } from '../src/types'

export default function useResolveDid(
  did?: string,
  coinType?: number,
  snapshot?: bigint,
) {
  return useSWR(
    did && coinType !== undefined && snapshot
      ? ['resolveDid', did, coinType, snapshot]
      : null,
    () => resolveDid(did!, { [coinType!]: snapshot! }),
  )
}
