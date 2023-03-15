import { DataType } from './constants'
import { isCommunity, isOption, isProposal, isVote } from './data-type'
import { id2Permalink } from './permalink'
import { Authorized } from './schemas/authorship'
import { Community } from './schemas/community'
import { Proposal } from './schemas/proposal'
import { Vote } from './schemas/vote'
import { isTestnet } from './constants'
import arweave, { jwk } from './sdks/arweave'
import { Option } from './schemas/option'

const textEncoder = new TextEncoder()

export async function uploadToArweave(
  document: Authorized<Community | Proposal | Option | Vote>,
): Promise<string> {
  const transaction = await arweave.createTransaction({
    data: Buffer.from(textEncoder.encode(JSON.stringify(document))),
  })
  const tags = getArweaveTags(document)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  while (!uploader.isComplete) {
    await uploader.uploadChunk()
  }
  return id2Permalink(transaction.id)
}

const defaultArweaveTags = {
  'Content-Type': 'application/json',
  'App-Name': 'Voty',
  'App-Version': `0.0.0${isTestnet ? '-test' : ''}`,
}

function getArweaveTags(
  document: Authorized<Community | Proposal | Option | Vote>,
) {
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
      'App-Index-Group': document.group,
    }
  }
  if (isOption(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.OPTION,
      'App-Index-Proposal': document.proposal,
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
