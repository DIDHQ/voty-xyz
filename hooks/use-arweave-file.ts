import Arweave from 'arweave'
import useSWR from 'swr'

const arweave = Arweave.init({})

export default function useArweaveFile(hash?: string) {
  return useSWR(hash ? ['file', hash] : null, () =>
    arweave.transactions.getData(hash!),
  )
}
