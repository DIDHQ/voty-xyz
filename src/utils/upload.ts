import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'

import { DataType } from './constants'
import { isCommunity, isProposal, isVote } from './data-type'
import { id2Permalink } from './permalink'
import { Authorized } from './schemas/authorship'
import { Community } from './schemas/community'
import { Proposal } from './schemas/proposal'
import { Vote } from './schemas/vote'
import { isTestnet } from './constants'

const textEncoder = new TextEncoder()

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!) as JWKInterface

const arweave = Arweave.init({
  host: 'arseed.web3infra.dev',
  port: 443,
  protocol: 'https',
})

export async function uploadToArweave(
  document: Authorized<Community | Proposal | Vote>,
): Promise<{ permalink: string; data: Buffer }> {
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
  'Content-Type': 'application/json',
  'App-Name': 'Voty',
  'App-Version': `0.0.0${isTestnet ? '-test' : ''}`,
}

function getArweaveTags(document: Authorized<Community | Proposal | Vote>) {
  if (isCommunity(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.COMMUNITY,
      'App-Index-Entry': document.authorship.author,
    }
  }
  if (isProposal(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.PROPOSAL,
      'App-Index-Community': document.community,
      'App-Index-Workgroup': document.workgroup,
    }
  }
  if (isVote(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.VOTE,
      'App-Index-Proposal': document.proposal,
    }
  }
  throw new Error('cannot get arweave tags')
}
