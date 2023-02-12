import useSWR from 'swr'

import { arweave } from '../src/arweave'
import { DataType } from '../src/constants'
import {
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
  optionWithAuthorSchema,
  voteWithAuthorSchema,
} from '../src/schemas'

export default function useArweaveData<T extends DataType>(
  type: T,
  id?: string,
) {
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
      const document = JSON.parse(data as string)

      if (type === DataType.COMMUNITY) {
        return communityWithAuthorSchema.parse(document)
      } else if (type === DataType.PROPOSAL) {
        return proposalWithAuthorSchema.parse(document)
      } else if (type === DataType.OPTION) {
        return optionWithAuthorSchema.parse(document)
      } else if (type === DataType.VOTE) {
        return voteWithAuthorSchema.parse(document)
      } else {
        throw new Error('data type not supported')
      }
    },
    { revalidateOnFocus: false },
  )
}
