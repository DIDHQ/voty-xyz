import { DataType } from '../constants'
import { Community, Option, Proposal, Vote } from '../schemas'

export function isCommunity(json: object): json is Community {
  return 'name' in json
}

export function isProposal(json: object): json is Proposal {
  return 'community' in json && 'group' in json
}

export function isOption(json: object): json is Option {
  return 'proposal' in json && 'title' in json
}

export function isVote(json: object): json is Vote {
  return 'proposal' in json && 'choice' in json
}

export function dataTypeOf(json: object): DataType {
  if (isCommunity(json)) {
    return DataType.COMMUNITY
  }
  if (isProposal(json)) {
    return DataType.PROPOSAL
  }
  if (isOption(json)) {
    return DataType.OPTION
  }
  if (isVote(json)) {
    return DataType.VOTE
  }
  throw new Error('unrecognized data type')
}
