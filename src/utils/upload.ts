import { DataType } from './constants'
import {
  isCommunity,
  isGrant,
  isGrantProposal,
  isGrantProposalVote,
  isGroup,
  isGroupProposal,
  isGroupProposalVote,
} from './data-type'
import { id2Permalink } from './permalink'
import { Authorized } from './schemas/basic/authorship'
import { Community } from './schemas/community'
import { Grant } from './schemas/grant'
import { GrantProposal } from './schemas/grant-proposal'
import { GrantProposalVote } from './schemas/grant-proposal-vote'
import { Group } from './schemas/group'
import { GroupProposal } from './schemas/group-proposal'
import { GroupProposalVote } from './schemas/group-proposal-vote'
import { isTestnet } from './constants'
import arweave, { jwk } from './sdks/arweave'

const textEncoder = new TextEncoder()

export async function uploadToArweave(
  document: Authorized<
    | Community
    | Grant
    | GrantProposal
    | GrantProposalVote
    | Group
    | GroupProposal
    | GroupProposalVote
  >,
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
  document: Authorized<
    | Community
    | Grant
    | GrantProposal
    | GrantProposalVote
    | Group
    | GroupProposal
    | GroupProposalVote
  >,
) {
  if (isCommunity(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.COMMUNITY,
      'App-Index-Entry': document.id,
    }
  }
  if (isGrant(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.GRANT,
      'App-Index-Community': document.community,
    }
  }
  if (isGrantProposal(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.GRANT_PROPOSAL,
      'App-Index-Grant': document.grant,
    }
  }
  if (isGrantProposalVote(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.GRANT_PROPOSAL_VOTE,
      'App-Index-Grant-Proposal': document.grant_proposal,
    }
  }
  if (isGroup(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.GROUP,
      'App-Index-Community': document.community,
    }
  }
  if (isGroupProposal(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.GROUP_PROPOSAL,
      'App-Index-Group': document.group,
    }
  }
  if (isGroupProposalVote(document)) {
    return {
      ...defaultArweaveTags,
      'App-Data-Type': DataType.GROUP_PROPOSAL_VOTE,
      'App-Index-Group-Proposal': document.group_proposal,
    }
  }
  throw new Error('cannot get arweave tags')
}
