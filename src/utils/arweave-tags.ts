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
  organization: string,
  workgroup?: string,
): { [key: string]: string } {
  if (isOrganization(json)) {
    return {
      ...defaultArweaveTags,
      'app-index-type': DataType.ORGANIZATION,
      'app-index-organization': organization,
    }
  }
  if (isProposal(json)) {
    return {
      ...defaultArweaveTags,
      'app-index-type': DataType.PROPOSAL,
      'app-index-organization': organization,
      'app-index-workgroup': json.workgroup,
    }
  }
  if (isVote(json) && workgroup) {
    return {
      ...defaultArweaveTags,
      'app-index-type': DataType.VOTE,
      'app-index-organization': organization,
      'app-index-workgroup': workgroup,
      'app-index-proposal': json.proposal,
    }
  }
  throw new Error('cannot get arweave tags')
}
