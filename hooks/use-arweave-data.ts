import Arweave from 'arweave'
import useSWR from 'swr'
import { ZodSchema } from 'zod'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

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
