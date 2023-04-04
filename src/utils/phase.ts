import type { Group } from './schemas/group'

export enum Phase {
  CONFIRMING = 'Confirming',
  ANNOUNCING = 'Announcing',
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
    timestamp.getTime() + (duration.announcing + duration.voting) * 1000
  ) {
    return Phase.VOTING
  }
  return Phase.ENDED
}
