import { createInstance } from 'dotbit'
import useSWR from 'swr'

import { didSuffixIs } from '../src/did'

const dotbit = createInstance()

export default function useDidConfig(did: string | undefined) {
  return useSWR<{ community?: string; delegation?: string }>(
    did ? ['didConfig', did] : null,
    async () => {
      if (didSuffixIs(did!, 'bit')) {
        const records = await dotbit.records(did!, 'dweb.arweave')
        return {
          community: records.find((record) => record.label === 'voty community')
            ?.value,
          delegation: records.find(
            (record) => record.label === 'voty delegation',
          )?.value,
        }
      }
      throw new Error(`unsupported did: ${did}`)
    },
  )
}
