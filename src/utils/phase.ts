import type { Grant } from './schemas/grant'
import type { Group } from './schemas/group'

export enum GrantPhase {
  CONFIRMING = 'Confirming',
  ANNOUNCING = 'Announcing',
  PROPOSING = 'Proposing',
  VOTING = 'Voting',
  ENDED = 'Ended',
}

export function getGrantPhase(
  now: Date,
  timestamp?: Date,
  duration?: Grant['duration'],
): GrantPhase {
  if (!timestamp || !duration) {
    return GrantPhase.CONFIRMING
  }
  if (now.getTime() < timestamp.getTime() + duration.announcing * 1000) {
    return GrantPhase.ANNOUNCING
  }
  if (
    now.getTime() <
    timestamp.getTime() + (duration.announcing + duration.proposing) * 1000
  ) {
    return GrantPhase.PROPOSING
  }
  if (
    now.getTime() <
    timestamp.getTime() +
      (duration.announcing + duration.proposing + duration.voting) * 1000
  ) {
    return GrantPhase.VOTING
  }
  return GrantPhase.ENDED
}

export enum GroupProposalPhase {
  CONFIRMING = 'Confirming',
  ANNOUNCING = 'Announcing',
  VOTING = 'Voting',
  ENDED = 'Ended',
}

export function getGroupProposalPhase(
  now: Date,
  timestamp?: Date,
  duration?: Group['duration'],
): GroupProposalPhase {
  if (!timestamp || !duration) {
    return GroupProposalPhase.CONFIRMING
  }
  if (now.getTime() < timestamp.getTime() + duration.announcing * 1000) {
    return GroupProposalPhase.ANNOUNCING
  }
  if (
    now.getTime() <
    timestamp.getTime() + (duration.announcing + duration.voting) * 1000
  ) {
    return GroupProposalPhase.VOTING
  }
  return GroupProposalPhase.ENDED
}
