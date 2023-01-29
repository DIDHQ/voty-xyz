import { DataType } from '../constants'
import { Authorized, Community, Proposal, Vote } from '../schemas'
import { isCommunity, isProposal, isVote } from './data-type'

export const defaultArweaveTags = {
  'content-type': 'application/json',
  'app-name': 'voty',
  'app-version': '0.0.0',
}

export function getArweaveTags(json: Authorized<Community | Proposal | Vote>) {
  if (isCommunity(json)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.COMMUNITY,
    }
  }
  if (isProposal(json)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.PROPOSAL,
      'app-index-community': json.community,
      'app-index-group': json.group,
    }
  }
  if (isVote(json)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.VOTE,
      'app-index-proposal': json.proposal,
    }
  }
  throw new Error('cannot get arweave tags')
}
