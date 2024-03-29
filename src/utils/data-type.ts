import { DataType } from './constants'
import { Community, communitySchema } from './schemas/v1/community'
import { Grant, grantSchema } from './schemas/v1/grant'
import { GrantProposal, grantProposalSchema } from './schemas/v1/grant-proposal'
import {
  GrantProposalSelect,
  grantProposalSelectSchema,
} from './schemas/v1/grant-proposal-select'
import {
  GrantProposalVote,
  grantProposalVoteSchema,
} from './schemas/v1/grant-proposal-vote'
import { Group, groupSchema } from './schemas/v1/group'
import { GroupProposal, groupProposalSchema } from './schemas/v1/group-proposal'
import {
  GroupProposalVote,
  groupProposalVoteSchema,
} from './schemas/v1/group-proposal-vote'

export function isCommunity(document: object): document is Community {
  return communitySchema.safeParse(document).success
}

export function isGrant(document: object): document is Grant {
  return grantSchema.safeParse(document).success
}

export function isGrantProposal(document: object): document is GrantProposal {
  return grantProposalSchema.safeParse(document).success
}

export function isGrantProposalSelect(
  document: object,
): document is GrantProposalSelect {
  return grantProposalSelectSchema.safeParse(document).success
}

export function isGrantProposalVote(
  document: object,
): document is GrantProposalVote {
  return grantProposalVoteSchema.safeParse(document).success
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
  if (isGrant(document)) {
    return DataType.GRANT
  }
  if (isGrantProposal(document)) {
    return DataType.GRANT_PROPOSAL
  }
  if (isGrantProposalSelect(document)) {
    return DataType.GRANT_PROPOSAL_SELECT
  }
  if (isGrantProposalVote(document)) {
    return DataType.GRANT_PROPOSAL_VOTE
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
