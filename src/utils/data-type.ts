import { DataType } from '../constants'
import { Community, Proposal, Vote } from '../schemas'

export function isCommunity(json: object): json is Community {
  return 'profile' in json && !('type' in json)
}

export function isProposal(json: object): json is Proposal {
  return 'type' in json
}

export function isVote(json: object): json is Vote {
  return 'proposal' in json
}

export function dataTypeOf(json: object): DataType {
  if (isCommunity(json)) {
    return DataType.COMMUNITY
  }
  if (isProposal(json)) {
    return DataType.PROPOSAL
  }
  if (isVote(json)) {
    return DataType.VOTE
  }
  throw new Error('unrecognized data type')
}
