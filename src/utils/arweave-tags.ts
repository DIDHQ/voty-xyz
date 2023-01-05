import { OrganizationWithSignature, ProposalWithSignature } from '../schemas'

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
  if ('type' in json) {
    return {
      ...defaultTags,
      'app-data-type': 'proposal',
      'app-parent-organization': json.organization,
      'app-parent-workgroup': json.workgroup,
    }
  }
  return {
    ...defaultTags,
    'app-data-type': 'organization',
    'app-parent-did': json.signature.did,
  }
}
