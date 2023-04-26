import { DataType } from './constants'
import { Community, communitySchema } from './schemas/community'
import { Group, groupSchema } from './schemas/group'
import { GroupProposal, groupProposalSchema } from './schemas/group-proposal'
import {
  GroupProposalVote,
  groupProposalVoteSchema,
} from './schemas/group-proposal-vote'

export function isCommunity(document: object): document is Community {
  return communitySchema.safeParse(document).success
}

export function isGroup(document: object): document is Group {
  return groupSchema.safeParse(document).success
}

export function isGroupProposal(document: object): document is GroupProposal {
  return groupProposalSchema.safeParse(document).success
}

export function isGroupProposalVote(
  document: object,
): document is GroupProposalVote {
  return groupProposalVoteSchema.safeParse(document).success
}

export function dataTypeOf(document: object): DataType {
  if (isCommunity(document)) {
    return DataType.COMMUNITY
  }
  if (isGroup(document)) {
    return DataType.GROUP
  }
  if (isGroupProposal(document)) {
    return DataType.GROUP_PROPOSAL
  }
  if (isGroupProposalVote(document)) {
    return DataType.GROUP_PROPOSAL_VOTE
  }
  throw new Error('unrecognized data type')
}
