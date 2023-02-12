import { DataType } from '../constants'
import { Authorized, Community, Proposal, Option, Vote } from '../schemas'
import { isCommunity, isOption, isProposal, isVote } from './data-type'

export const defaultArweaveTags = {
  'content-type': 'application/json',
  'app-name': 'voty',
  'app-version': '0.0.0',
}

export function getArweaveTags(
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
