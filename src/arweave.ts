import Arweave from 'arweave'

export const arweave = Arweave.init({
  host: 'arseed.web3infra.dev',
  port: 443,
  protocol: 'https',
})

export async function getArweaveData(uri: string) {
  if (!uri.startsWith('ar://')) {
    throw new Error('uri not supported')
  }
  const id = uri.replace(/^ar:\/\//, '')
  const data = await arweave.transactions.getData(id, {
    decode: true,
    string: true,
  })
  return JSON.parse(data as string)
}
