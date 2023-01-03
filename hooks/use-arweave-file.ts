import Arweave from 'arweave'
import useSWR from 'swr'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function useArweaveFile<T>(hash?: string) {
  return useSWR(
    hash ? ['file', hash] : null,
    async () => {
      const data = await arweave.transactions.getData(hash!, {
        decode: true,
        string: true,
      })
      return JSON.parse(data as string) as T
    },
    { revalidateOnFocus: false },
  )
}
