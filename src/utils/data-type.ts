import { DataType } from './constants'
import { Community } from './schemas/community'
import { Proposal } from './schemas/proposal'
import { Vote } from './schemas/vote'

export function isCommunity(document: object): document is Community {
  return 'name' in document
}

export function isProposal(document: object): document is Proposal {
  return 'community' in document && 'group' in document
}

export function isVote(document: object): document is Vote {
  return 'proposal' in document && 'choice' in document
}

export function dataTypeOf(document: object): DataType {
  if (isCommunity(document)) {
    return DataType.COMMUNITY
  }
  if (isProposal(document)) {
    return DataType.PROPOSAL
  }
  if (isVote(document)) {
    return DataType.VOTE
  }
  throw new Error('unrecognized data type')
}
