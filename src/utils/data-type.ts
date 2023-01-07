import { DataType } from '../constants'
import { Organization, Proposal, Vote } from '../schemas'

export function isOrganization(json: object): json is Organization {
  return 'profile' in json && !('type' in json)
}

export function isProposal(json: object): json is Proposal {
  return 'type' in json
}

export function isVote(json: object): json is Vote {
  return 'proposal' in json
}

export function dataTypeOf(json: object): DataType {
  if (isOrganization(json)) {
    return DataType.ORGANIZATION
  }
  if (isProposal(json)) {
    return DataType.PROPOSAL
  }
  if (isVote(json)) {
    return DataType.VOTE
  }
  throw new Error('unrecognized data type')
}
