import type { Group } from './schemas/group'

export enum Phase {
  CONFIRMING = 'Confirming',
  ANNOUNCING = 'Announcing',
  PROPOSING = 'Proposing',
  VOTING = 'Voting',
  ENDED = 'Ended',
}

export function getPhase(
  now: Date,
  timestamp?: Date,
  duration?: Group['duration'],
): Phase {
  if (!timestamp || !duration) {
    return Phase.CONFIRMING
  }
  if (now.getTime() < timestamp.getTime() + duration.announcing * 1000) {
    return Phase.ANNOUNCING
  }
  if (
    now.getTime() <
    timestamp.getTime() +
      (duration.announcing +
        ('adding_option' in duration ? duration.adding_option : 0)) *
        1000
  ) {
    return Phase.PROPOSING
  }
  if (
    now.getTime() <
    timestamp.getTime() +
      (duration.announcing +
        ('adding_option' in duration ? duration.adding_option : 0) +
        duration.voting) *
        1000
  ) {
    return Phase.VOTING
  }
  return Phase.ENDED
}
