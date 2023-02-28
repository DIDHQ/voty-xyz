import type { Workgroup } from './schemas/workgroup'

export enum Period {
  PENDING = 'Pending',
  ANNOUNCING = 'Announcing',
  VOTING = 'Voting',
  ENDED = 'Ended',
}

export function getPeriod(
  now: Date,
  timestamp?: Date,
  duration?: Workgroup['duration'],
): Period {
  if (!timestamp || !duration) {
    return Period.PENDING
  }
  if (now.getTime() < timestamp.getTime() + duration.announcement * 1000) {
    return Period.ANNOUNCING
  }
  if (
    now.getTime() <
    timestamp.getTime() + (duration.announcement + duration.voting) * 1000
  ) {
    return Period.VOTING
  }
  return Period.ENDED
}
