import Decimal from 'decimal.js'
import { uniq, without } from 'lodash-es'

import { GroupProposal } from './schemas/group-proposal'

export function updateChoice(
  type: GroupProposal['voting_type'],
  choice: string | undefined,
  option: string,
): string {
  try {
    if (type === 'single') {
      return JSON.stringify(option)
    }
    if (type === 'approval') {
      const array = JSON.parse(choice || '[]') as string[]
      return JSON.stringify(
        array.includes(option)
          ? without(array, option)
          : uniq([...array, option]),
      )
    }
    return ''
  } catch {
    return ''
  }
}

export function checkChoice(
  type: GroupProposal['voting_type'],
  choice: string,
  option: string,
): boolean {
  try {
    if (type === 'single') {
      return JSON.parse(choice) === option
    }
    if (type === 'approval') {
      return (JSON.parse(choice || '[]') as string[]).includes(option)
    }
    return false
  } catch {
    return false
  }
}

export function powerOfChoice(
  type: GroupProposal['voting_type'],
  choice: string,
  power: Decimal,
): { [option: string]: Decimal | undefined } {
  try {
    if (type === 'single') {
      return { [JSON.parse(choice) as string]: power }
    }
    if (type === 'approval') {
      const array = JSON.parse(choice || '[]') as string[]
      return array.reduce((obj, option) => {
        obj[option] = power.dividedBy(array.length)
        return obj
      }, {} as { [option: string]: Decimal })
    }
    return {}
  } catch {
    return {}
  }
}

export function choiceIsEmpty(
  type: GroupProposal['voting_type'],
  choice: string | undefined,
): boolean {
  if (type === 'single') {
    return !choice
  }
  if (type === 'approval') {
    return !choice || choice === '[]'
  }
  return true
}

export function stringifyChoice(
  type: GroupProposal['voting_type'],
  choice: string,
) {
  try {
    if (type === 'single') {
      return JSON.parse(choice) as string
    }
    if (type === 'approval') {
      return (JSON.parse(choice || '[]') as string[]).sort().join(', ')
    }
    return ''
  } catch {
    return ''
  }
}
