import { createInstance } from 'dotbit'
import useSWR from 'swr'

import { didSuffixIs } from '../src/did'

export default function useEntryConfig(entry: string | undefined) {
  return useSWR<{ community?: string; delegation?: string }>(
    entry ? ['entryConfig', entry] : null,
    async () => {
      if (didSuffixIs(entry!, 'bit')) {
        const dotbit = createInstance()
        const records = await dotbit.records(
          entry!,
          'custom_key.voty_community',
        )
        return {
          community: records[0]?.value,
        }
      }
      throw new Error(`unsupported entry: ${entry}`)
    },
  )
}
