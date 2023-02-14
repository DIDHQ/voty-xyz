import { Group } from './schemas'

export enum Period {
  ANNOUNCING,
  ADDING_OPTION,
  VOTING,
  ENDED,
}

export function getPeriod(
  now: number,
  timestamp: number,
  duration: Group['duration'],
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
