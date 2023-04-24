import { DataType } from './constants'
import { Community, communitySchema } from './schemas/community'
import { Group, groupSchema } from './schemas/group'
import { Proposal, proposalSchema } from './schemas/proposal'
import { Vote, voteSchema } from './schemas/vote'

export function isCommunity(document: object): document is Community {
  return communitySchema.safeParse(document).success
}

export function isGroup(document: object): document is Group {
  return groupSchema.safeParse(document).success
}

export function isProposal(document: object): document is Proposal {
  return proposalSchema.safeParse(document).success
}

export function isVote(document: object): document is Vote {
  return voteSchema.safeParse(document).success
}

export function dataTypeOf(document: object): DataType {
  if (isCommunity(document)) {
    return DataType.COMMUNITY
  }
  if (isGroup(document)) {
    return DataType.GROUP
  }
  if (isProposal(document)) {
    return DataType.PROPOSAL
  }
  if (isVote(document)) {
    return DataType.VOTE
  }
  throw new Error('unrecognized data type')
}
