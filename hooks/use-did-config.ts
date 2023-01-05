import { createInstance } from 'dotbit'
import useSWR from 'swr'
import { didSuffixIs } from '../src/did'

const dotbit = createInstance()

export default function useDidConfig(did: string | undefined) {
  return useSWR<{ organization?: string; delegate?: string }>(
    did ? ['didConfig', did] : null,
    async () => {
      if (didSuffixIs(did!, 'bit')) {
        const records = await dotbit.records(did!, 'dweb.arweave')
        return {
          organization: records.find(
            (record) => record.label === 'voty organization',
          )?.value,
          delegate: records.find((record) => record.label === 'voty delegate')
            ?.value,
        }
      }
      throw new Error(`unsupported did: ${did}`)
    },
  )
}
