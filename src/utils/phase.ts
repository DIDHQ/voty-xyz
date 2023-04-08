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
  phase?: Group['duration'],
): Phase {
  if (!timestamp || !phase) {
    return Phase.CONFIRMING
  }
  if (now.getTime() < timestamp.getTime() + phase.pending * 1000) {
    return Phase.ANNOUNCING
  }
  if (
    now.getTime() <
    timestamp.getTime() + (phase.pending + phase.voting) * 1000
  ) {
    return Phase.VOTING
  }
  return Phase.ENDED
}
