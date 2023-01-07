import { OrganizationWithSignature, ProposalWithSignature } from '../schemas'
import { isOrganization, isProposal } from './data-type'

const defaultTags = {
  'content-type': 'application/json',
  'app-name': 'voty',
  'app-version': '0.0.0',
}

export function getArweaveTags(
  json: OrganizationWithSignature | ProposalWithSignature,
): {
  [key: string]: string
} {
  if (isOrganization(json)) {
    return {
      ...defaultTags,
      'app-data-type': 'organization',
      'app-current-did': json.signature.did,
    }
  }
  if (isProposal(json)) {
    return {
      ...defaultTags,
      'app-data-type': 'proposal',
      'app-current-organization': json.signature.did,
      'app-current-workgroup': json.workgroup,
    }
  }
  throw new Error('cannot get arweave tags')
}
