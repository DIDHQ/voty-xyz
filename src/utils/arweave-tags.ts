import { DataType } from '../constants'
import {
  CommunityWithSignature,
  ProposalWithSignature,
  VoteWithSignature,
} from '../schemas'
import { isCommunity, isProposal, isVote } from './data-type'

export const defaultArweaveTags = {
  'content-type': 'application/json',
  'app-name': 'voty',
  'app-version': '0.0.0',
}

export function getArweaveTags(
  json: CommunityWithSignature | ProposalWithSignature | VoteWithSignature,
) {
  if (isCommunity(json)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.COMMUNITY,
      'app-index-did': json.did,
    }
  }
  if (isProposal(json)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.PROPOSAL,
      'app-index-did': json.did,
      'app-index-community': json.community,
      'app-index-workgroup': json.workgroup,
    }
  }
  if (isVote(json)) {
    return {
      ...defaultArweaveTags,
      'app-data-type': DataType.VOTE,
      'app-index-did': json.did,
      'app-index-community': json.community,
      'app-index-workgroup': json.workgroup,
      'app-index-proposal': json.proposal,
    }
  }
  throw new Error('cannot get arweave tags')
}
