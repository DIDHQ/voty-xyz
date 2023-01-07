import Arweave from 'arweave'

import { OrganizationWithSignature, ProposalWithSignature } from '../schemas'
import { isOrganization, isProposal } from './data-type'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export const defaultArweaveTags = {
  'content-type': 'application/json',
  'app-name': 'voty',
  'app-version': '0.0.0',
}

export async function getArweaveTags(
  json: OrganizationWithSignature | ProposalWithSignature,
): Promise<{ [key: string]: string }> {
  if (isOrganization(json)) {
    return {
      ...defaultArweaveTags,
      'app-index-type': 'organization',
      'app-index-did': json.signature.did,
    }
  }
  if (isProposal(json)) {
    const data = await arweave.transactions.getData(json.organization, {
      decode: true,
      string: true,
    })
    const organization = JSON.parse(data as string)
    return {
      ...defaultArweaveTags,
      'app-index-type': 'proposal',
      'app-index-organization': organization.signature.did,
      'app-index-workgroup': json.workgroup,
    }
  }
  throw new Error('cannot get arweave tags')
}
