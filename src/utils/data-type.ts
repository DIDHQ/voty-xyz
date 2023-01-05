import { DataType } from '../constants'
import { Organization, Proposal } from '../schemas'

export function isOrganization(json: object): json is Organization {
  return 'profile' in json && !('type' in json)
}

export function isProposal(json: object): json is Proposal {
  return 'type' in json
}

export function dataTypeOf(json: object): DataType {
  if (isOrganization(json)) {
    return DataType.ORGANIZATION
  }
  if (isProposal(json)) {
    return DataType.PROPOSAL
  }
  throw new Error('unrecognized data type')
}
