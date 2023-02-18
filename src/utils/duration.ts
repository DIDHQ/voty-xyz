import { Workgroup } from './schemas/workgroup'

export enum Period {
  ANNOUNCING = 'Announcing',
  ADDING_OPTION = 'Adding option',
  VOTING = 'Voting',
  ENDED = 'Ended',
}

export function getPeriod(
  now: number,
  timestamp: number,
  duration: Workgroup['duration'],
): Period {
  if (now < timestamp + duration.announcement) {
    return Period.ANNOUNCING
  }
  if (now < timestamp + duration.announcement + (duration.adding_option || 0)) {
    return Period.ADDING_OPTION
  }
  if (
    now <
    timestamp +
      duration.announcement +
      (duration.adding_option || 0) +
      duration.voting
  ) {
    return Period.VOTING
  }
  return Period.ENDED
}
