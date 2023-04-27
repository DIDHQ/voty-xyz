import Decimal from 'decimal.js'
import { uniq, without } from 'lodash-es'

import { GroupProposal } from './schemas/group-proposal'

export function updateChoice(
  type: GroupProposal['voting_type'],
  powers: { [option: string]: string },
  option: string,
  power: string,
): { [option: string]: string } {
  try {
    if (type === 'single') {
      return { [option]: power }
    }
    if (type === 'approval') {
      const options = powers[option]
        ? without(Object.keys(powers), option)
        : uniq([...Object.keys(powers), option])
      const averagePower = new Decimal(power).dividedBy(options.length)
      return options.reduce((obj, option) => {
        obj[option] = averagePower.toString()
        return obj
      }, {} as { [option: string]: string })
    }
    return powers
  } catch {
    return powers
  }
}

export function totalPower(powers: { [option: string]: string }): string {
  return Object.values(powers)
    .reduce((sum, power) => sum.add(power), new Decimal(0))
    .toString()
}

export function stringifyChoice(powers: { [option: string]: string }): string {
  return Object.keys(powers).sort().join(', ')
}
