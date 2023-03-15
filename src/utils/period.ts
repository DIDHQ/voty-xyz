import type { Group } from './schemas/group'

export enum Period {
  CONFIRMING = 'Confirming',
  PENDING = 'Pending',
  PROPOSING = 'Proposing',
  VOTING = 'Voting',
  ENDED = 'Ended',
}

export function getPeriod(
  now: Date,
  timestamp?: Date,
  duration?: Group['duration'],
): Period {
  if (!timestamp || !duration) {
    return Period.CONFIRMING
  }
  if (now.getTime() < timestamp.getTime() + duration.pending * 1000) {
    return Period.PENDING
  }
  if (
    now.getTime() <
    timestamp.getTime() +
      (duration.pending +
        ('adding_option' in duration ? duration.adding_option : 0)) *
        1000
  ) {
    return Period.PROPOSING
  }
  if (
    now.getTime() <
    timestamp.getTime() +
      (duration.pending +
        ('adding_option' in duration ? duration.adding_option : 0) +
        duration.voting) *
        1000
  ) {
    return Period.VOTING
  }
  return Period.ENDED
}
