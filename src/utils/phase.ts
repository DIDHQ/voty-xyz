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
  phase?: Grant['duration'],
): GroupProposalPhase {
  if (!timestamp || !phase) {
    return GroupProposalPhase.CONFIRMING
  }
  if (now.getTime() < timestamp.getTime() + phase.announcing * 1000) {
    return GroupProposalPhase.ANNOUNCING
  }
  if (
    now.getTime() <
    timestamp.getTime() + (phase.announcing + phase.proposing) * 1000
  ) {
    return GroupProposalPhase.VOTING
  }
  if (
    now.getTime() <
    timestamp.getTime() +
      (phase.announcing + phase.proposing + phase.voting) * 1000
  ) {
    return GroupProposalPhase.VOTING
  }
  return GroupProposalPhase.ENDED
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
  phase?: Group['duration'],
): GroupProposalPhase {
  if (!timestamp || !phase) {
    return GroupProposalPhase.CONFIRMING
  }
  if (now.getTime() < timestamp.getTime() + phase.announcing * 1000) {
    return GroupProposalPhase.ANNOUNCING
  }
  if (
    now.getTime() <
    timestamp.getTime() + (phase.announcing + phase.voting) * 1000
  ) {
    return GroupProposalPhase.VOTING
  }
  return GroupProposalPhase.ENDED
}
