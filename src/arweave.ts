import Arweave from 'arweave'

export const arweave = Arweave.init({
  host: 'arseed.web3infra.dev',
  port: 443,
  protocol: 'https',
})

export async function getArweaveTimestamp(
  permalink: string,
): Promise<number | undefined> {
  if (!permalink.startsWith('ar://')) {
    throw new Error('permalink not supported')
  }
  const status = await arweave.transactions.getStatus(permalink2Id(permalink))
  if (status.confirmed?.block_indep_hash) {
    const block = await arweave.blocks.get(status.confirmed.block_indep_hash)
    return block.timestamp
  }
  return undefined
}

export async function getArweaveData(
  permalink: string,
): Promise<object | undefined> {
  if (!permalink.startsWith('ar://')) {
    throw new Error('permalink not supported')
  }
  const id = permalink2Id(permalink)
  const data = await arweave.transactions.getData(id, {
    decode: true,
    string: true,
  })
  return typeof data === 'string' && data ? JSON.parse(data) : undefined
}

export function id2Permalink(id: string) {
  return `ar://${id}`
}

export function permalink2Id(permalink: string) {
  return permalink.replace(/^ar:\/\//, '')
}

export function permalink2Url(permalink: string) {
  return `https://arseed.web3infra.dev/${permalink2Id(permalink)}`
}
