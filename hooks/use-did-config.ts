import { createInstance } from 'dotbit'
import useSWR from 'swr'

import { didSuffixIs } from '../src/did'

export default function useEntryRecord(did?: string) {
  return useSWR<{ community?: string }>(
    did ? ['entryRecord', did] : null,
    async () => {
      if (didSuffixIs(did!, 'bit')) {
        const dotbit = createInstance()
        const records = await dotbit.records(did!, 'custom_key.voty_community')
        return {
          community: records[0]?.value,
        }
      }
      throw new Error(`unsupported entry: ${did}`)
    },
  )
}
