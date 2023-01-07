import useSWR from 'swr'
import { GraphQLClient } from 'graphql-request'
import { getSdk } from '../src/generated/graphql'

const client = new GraphQLClient('https://arweave.dev/graphql')

const sdk = getSdk(client)

export default function useArweaveList(tags?: {
  [key: string]: string | undefined
}) {
  return useSWR(tags ? ['arweaveList', tags] : null, async () => {
    const { transactions } = await sdk.listTransactions({
      tags: Object.entries(tags!).map(([key, value]) => ({
        name: key,
        values: value ? [value] : [],
      })),
    })
    return transactions.edges.map((edge) => edge.node.id)
  })
}
