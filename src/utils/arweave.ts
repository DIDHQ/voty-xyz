import Arweave from 'arweave'
import type { JWKInterface } from 'arweave/node/lib/wallet'

import { DataType } from './constants'
import { isCommunity, isProposal, isOption, isVote } from './data-type'
import { fetchJson } from './fetcher'
import { id2Permalink, permalink2Id } from './permalink'
import { Authorized, Community, Option, Proposal, Vote } from './schemas'

const host = 'arseed.web3infra.dev'

export async function getArweaveTimestamp(
  permalink: string,
): Promise<number | undefined> {
  if (!permalink.startsWith('ar://')) {
    throw new Error('permalink not supported')
  }
  const status = await fetchJson<{
    block_indep_hash: string
    block_height: number
    number_of_confirmations: number
  }>(`https://${host}/tx/${permalink2Id(permalink)}/status`)
  if (status.block_indep_hash) {
    const block = await fetchJson<{ timestamp: number }>(
      `https://${host}/block/hash/${status.block_indep_hash}`,
    )
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
  return fetchJson<object>(`https://${host}/${permalink2Id(permalink)}`)
}

const defaultArweaveTags = {
  'content-type': 'application/json',
  'app-name': 'voty',
  'app-version': '0.0.0',
}

function getArweaveTags(
  document: Authorized<Community | Proposal | Option | Vote>,
) {
  if (isCommunity(document)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.COMMUNITY,
    }
  }
  if (isProposal(document)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.PROPOSAL,
      'app-index-community': document.community,
      'app-index-group': document.group.toString(),
    }
  }
  if (isOption(document)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.OPTION,
      'app-index-proposal': document.proposal,
    }
  }
  if (isVote(document)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.VOTE,
      'app-index-proposal': document.proposal,
    }
  }
  throw new Error('cannot get arweave tags')
}

const textEncoder = new TextEncoder()

export async function uploadToArweave(
  document: Authorized<Community | Proposal | Option | Vote>,
  jwk: JWKInterface,
): Promise<{ permalink: string; data: Buffer }> {
  const arweave = Arweave.init({
    host,
    port: 443,
    protocol: 'https',
  })
  const data = Buffer.from(textEncoder.encode(JSON.stringify(document)))
  const transaction = await arweave.createTransaction({ data })
  const tags = getArweaveTags(document)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  while (!uploader.isComplete) {
    await uploader.uploadChunk()
  }
  return { permalink: id2Permalink(transaction.id), data }
}
