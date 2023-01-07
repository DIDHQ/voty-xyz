import { DataType } from '../constants'
import {
  OrganizationWithSignature,
  ProposalWithSignature,
  VoteWithSignature,
} from '../schemas'
import { isOrganization, isProposal, isVote } from './data-type'

export const defaultArweaveTags = {
  'content-type': 'application/json',
  'app-name': 'voty',
  'app-version': '0.0.0',
}

export function getArweaveTags(
  json: OrganizationWithSignature | ProposalWithSignature | VoteWithSignature,
): { [key: string]: string } {
  if (isOrganization(json)) {
    return {
      ...defaultArweaveTags,
      'app-index-type': DataType.ORGANIZATION,
      'app-index-did': json.did,
    }
  }
  if (isProposal(json)) {
    return {
      ...defaultArweaveTags,
      'app-index-type': DataType.PROPOSAL,
      'app-index-did': json.did,
      'app-index-organization': json.organization,
      'app-index-workgroup': json.workgroup,
    }
  }
  if (isVote(json)) {
    return {
      ...defaultArweaveTags,
      'app-index-type': DataType.VOTE,
      'app-index-did': json.did,
      'app-index-organization': json.organization,
      'app-index-workgroup': json.workgroup,
      'app-index-proposal': json.proposal,
    }
  }
  throw new Error('cannot get arweave tags')
}
