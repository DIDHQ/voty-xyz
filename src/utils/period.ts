import type { Workgroup } from './schemas/workgroup'

export enum Period {
  CONFIRMING = 'Confirming',
  PENDING = 'Pending',
  VOTING = 'Voting',
  ENDED = 'Ended',
}

export function getPeriod(
  now: Date,
  timestamp?: Date,
  duration?: Workgroup['duration'],
): Period {
  if (!timestamp || !duration) {
    return Period.CONFIRMING
  }
  if (now.getTime() < timestamp.getTime() + duration.announcement * 1000) {
    return Period.PENDING
  }
  if (
    now.getTime() <
    timestamp.getTime() + (duration.announcement + duration.voting) * 1000
  ) {
    return Period.VOTING
  }
  return Period.ENDED
}
