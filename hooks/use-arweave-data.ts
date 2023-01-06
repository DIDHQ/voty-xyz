import Arweave from 'arweave'
import useSWR from 'swr'
import { ZodSchema } from 'zod'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function useArweaveData<T>(schema: ZodSchema<T>, hash?: string) {
  return useSWR(
    hash ? ['arweaveData', hash] : null,
    async () => {
      const data = await arweave.transactions.getData(hash!, {
        decode: true,
        string: true,
      })
      return schema.parse(JSON.parse(data as string))
    },
    { revalidateOnFocus: false },
  )
}
