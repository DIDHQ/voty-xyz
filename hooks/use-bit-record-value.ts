import { createInstance } from 'dotbit'
import useSWR from 'swr'

const dotbit = createInstance()

export default function useBitRecordValue(
  account: string | undefined,
  label: 'voty' | 'voty delegate',
) {
  return useSWR(account ? ['bitRecord', account, label] : null, async () => {
    const records = await dotbit.records(account!, 'dweb.arweave')
    return records.find((record) => record.label === label)?.value
  })
}
