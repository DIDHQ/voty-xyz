import { DataType, isTestnet } from './constants'
import {
  isCommunity,
  isGrant,
  isGrantProposal,
  isGrantProposalSelect,
  isGrantProposalVote,
  isGroup,
  isGroupProposal,
  isGroupProposalVote,
} from './data-type'
import { id2Permalink } from './permalink'
import { Authorized } from './schemas/basic/authorship'
import { Community } from './schemas/v1/community'
import { Grant } from './schemas/v1/grant'
import { GrantProposal } from './schemas/v1/grant-proposal'
import { GrantProposalSelect } from './schemas/v1/grant-proposal-select'
import { GrantProposalVote } from './schemas/v1/grant-proposal-vote'
import { Group } from './schemas/v1/group'
import { GroupProposal } from './schemas/v1/group-proposal'
import { GroupProposalVote } from './schemas/v1/group-proposal-vote'
import arweave, { jwk } from './sdks/arweave'

const textEncoder = new TextEncoder()

export async function getUploader(data: Buffer, tags: Record<string, string>) {
  const transaction = await arweave.createTransaction({ data })
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  return arweave.transactions.getUploader(transaction)
}

export async function uploadToArweave(
  document: Authorized<
    | Community
    | Grant
    | GrantProposal
    | GrantProposalSelect
    | GrantProposalVote
    | Group
    | GroupProposal
    | GroupProposalVote
  >,
): Promise<string> {
  try {
    const uploader = await getUploader(
      Buffer.from(textEncoder.encode(JSON.stringify(document))),
      getArweaveTags(document),
    )
    while (!uploader.isComplete) {
      await uploader.uploadChunk()
    }
    return id2Permalink(uploader.toJSON().transaction.id)
  } catch (err) {
    console.error(err)
    throw new Error('Arweave API error, please try again later.')
  }
}

export const defaultArweaveTags = {
  'App-Name': 'Voty',
  'App-Version': `0.0.2${isTestnet ? '-test' : ''}`,
}

function getArweaveTags(
  document: Authorized<
    | Community
    | Grant
    | GrantProposal
    | GrantProposalSelect
    | GrantProposalVote
    | Group
    | GroupProposal
    | GroupProposalVote
  >,
) {
  if (isCommunity(document)) {
    return {
      ...defaultArweaveTags,
      'Content-Type': 'application/json',
      'App-Data-Type': DataType.COMMUNITY,
      'App-Index-Entry': document.id,
    }
  }
  if (isGrant(document)) {
    return {
      ...defaultArweaveTags,
      'Content-Type': 'application/json',
      'App-Data-Type': DataType.GRANT,
      'App-Index-Community': document.community,
    }
  }
  if (isGrantProposal(document)) {
    return {
      ...defaultArweaveTags,
      'Content-Type': 'application/json',
      'App-Data-Type': DataType.GRANT_PROPOSAL,
      'App-Index-Grant': document.grant,
    }
  }
  if (isGrantProposalSelect(document)) {
    return {
      ...defaultArweaveTags,
      'Content-Type': 'application/json',
      'App-Data-Type': DataType.GRANT_PROPOSAL_SELECT,
      'App-Index-Grant-Proposal': document.grant_proposal,
    }
  }
  if (isGrantProposalVote(document)) {
    return {
      ...defaultArweaveTags,
      'Content-Type': 'application/json',
      'App-Data-Type': DataType.GRANT_PROPOSAL_VOTE,
      'App-Index-Grant-Proposal': document.grant_proposal,
    }
  }
  if (isGroup(document)) {
    return {
      ...defaultArweaveTags,
      'Content-Type': 'application/json',
      'App-Data-Type': DataType.GROUP,
      'App-Index-Community': document.community,
    }
  }
  if (isGroupProposal(document)) {
    return {
      ...defaultArweaveTags,
      'Content-Type': 'application/json',
      'App-Data-Type': DataType.GROUP_PROPOSAL,
      'App-Index-Group': document.group,
    }
  }
  if (isGroupProposalVote(document)) {
    return {
      ...defaultArweaveTags,
      'Content-Type': 'application/json',
      'App-Data-Type': DataType.GROUP_PROPOSAL_VOTE,
      'App-Index-Group-Proposal': document.group_proposal,
    }
  }
  throw new Error('cannot get arweave tags')
}
