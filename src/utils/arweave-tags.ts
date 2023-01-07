import { DataType } from '../constants'
import { OrganizationWithSignature, ProposalWithSignature } from '../schemas'
import { isOrganization, isProposal } from './data-type'

const defaultTags = {
  'content-type': 'application/json',
  'app-name': 'voty',
  'app-version': '0.0.0',
}

export function arweaveTagsOfDataType(type: DataType): {
  [key: string]: string
} {
  if (type === DataType.ORGANIZATION) {
    return {
      ...defaultTags,
      'app-data-type': 'organization',
    }
  }
  if (type === DataType.PROPOSAL) {
    return {
      ...defaultTags,
      'app-data-type': 'proposal',
    }
  }
  throw new Error('cannot get arweave tags of data type')
}

export function getArweaveTags(
  json: OrganizationWithSignature | ProposalWithSignature,
): {
  [key: string]: string
} {
  if (isOrganization(json)) {
    return {
      ...arweaveTagsOfDataType(DataType.ORGANIZATION),
      'app-current-did': json.signature.did,
    }
  }
  if (isProposal(json)) {
    return {
      ...arweaveTagsOfDataType(DataType.PROPOSAL),
      'app-current-organization': json.organization,
      'app-current-workgroup': json.workgroup,
    }
  }
  throw new Error('cannot get arweave tags')
}
