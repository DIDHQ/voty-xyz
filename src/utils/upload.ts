import Arweave from 'arweave'

import { DataType } from './constants'
import { isCommunity, isProposal, isOption, isVote } from './data-type'
import { id2Permalink } from './permalink'
import { Authorized, Community, Proposal, Option, Vote } from './schemas'

const textEncoder = new TextEncoder()

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

export async function uploadToArweave(
  document: Authorized<Community | Proposal | Option | Vote>,
): Promise<{ permalink: string; data: Buffer }> {
  const arweave = Arweave.init({
    host: 'arseed.web3infra.dev',
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
