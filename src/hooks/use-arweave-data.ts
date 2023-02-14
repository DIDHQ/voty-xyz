import { useQuery } from '@tanstack/react-query'

import { arweave } from '../utils/arweave'
import { DataType } from '../utils/constants'
import {
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
  optionWithAuthorSchema,
  voteWithAuthorSchema,
} from '../utils/schemas'

export default function useArweaveData<T extends DataType>(
  type: T,
  id?: string,
) {
  return useQuery(
    ['arweaveData', id],
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
    { enabled: !!id, refetchOnWindowFocus: false },
  )
}
