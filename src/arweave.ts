import Arweave from 'arweave'

export const arweave = Arweave.init({
  host: 'arseed.web3infra.dev',
  port: 443,
  protocol: 'https',
})

export async function getArweaveTimestamp(
  uri: string,
): Promise<number | undefined> {
  if (!uri.startsWith('ar://')) {
    throw new Error('uri not supported')
  }
  const status = await arweave.transactions.getStatus(
    uri.replace(/^ar:\/\//, ''),
  )
  if (status.confirmed?.block_indep_hash) {
    const block = await arweave.blocks.get(status.confirmed.block_indep_hash)
    return block.timestamp
  }
  return undefined
}

export async function getArweaveData(uri: string): Promise<object | undefined> {
  if (!uri.startsWith('ar://')) {
    throw new Error('uri not supported')
  }
  const id = uri.replace(/^ar:\/\//, '')
  const data = await arweave.transactions.getData(id, {
    decode: true,
    string: true,
  })
  return typeof data === 'string' && data ? JSON.parse(data) : undefined
}

export function idToURI(id: string) {
  return `ar://${id}`
}
