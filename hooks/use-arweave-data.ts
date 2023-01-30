import useSWR from 'swr'
import { ZodSchema } from 'zod'

import { arweave } from '../src/arweave'

export default function useArweaveData<T>(schema: ZodSchema<T>, id?: string) {
  return useSWR(
    id ? ['arweaveData', id] : null,
    async () => {
      const data = await arweave.transactions.getData(
        id!.replace(/^ar:\/\//, ''),
        {
          decode: true,
          string: true,
        },
      )
      return schema.parse(JSON.parse(data as string))
    },
    { revalidateOnFocus: false },
  )
}
