import type { Workgroup } from './schemas/workgroup'

export enum Period {
  PENDING = 'Pending',
  ANNOUNCING = 'Announcing',
  ADDING_OPTION = 'Adding option',
  VOTING = 'Voting',
  ENDED = 'Ended',
}

export function getPeriod(
  now: Date,
  timestamp: Date,
  duration: Workgroup['duration'],
): Period {
  if (now.getTime() < timestamp.getTime() + duration.announcement * 1000) {
    return Period.ANNOUNCING
  }
  if (
    now.getTime() <
    timestamp.getTime() +
      (duration.announcement + (duration.adding_option || 0)) * 1000
  ) {
    return Period.ADDING_OPTION
  }
  if (
    now.getTime() <
    timestamp.getTime() +
      (duration.announcement +
        (duration.adding_option || 0) +
        duration.voting) *
        1000
  ) {
    return Period.VOTING
  }
  return Period.ENDED
}
