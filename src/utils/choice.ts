import Decimal from 'decimal.js'
import { mapValues, uniq, without } from 'lodash-es'

import { PositiveDecimal } from './schemas/basic/positive-decimal'

export function updateChoice(
  powers: Record<string, PositiveDecimal> | undefined,
  option: string,
): Record<string, PositiveDecimal> {
  const options = powers?.[option]
    ? without(Object.keys(powers), option)
    : uniq([...Object.keys(powers || {}), option])
  return options.reduce((obj, option) => {
    obj[option] = '1'
    return obj
  }, {} as Record<string, PositiveDecimal>)
}

export function checkChoice(
  powers: Record<string, PositiveDecimal> | undefined,
  option: string,
): boolean {
  return !!powers?.[option]
}

export function powerOfChoice(
  powers: Record<string, PositiveDecimal> | undefined,
  totalPower: Decimal,
): { [option: string]: Decimal | undefined } {
  const denominator = powers
    ? Object.values(powers).reduce(
        (sum, power) => sum.add(power),
        new Decimal(0),
      )
    : new Decimal(1)
  return mapValues(powers, (power) =>
    totalPower.dividedBy(denominator).mul(power),
  )
}

export function choiceIsEmpty(
  powers: Record<string, PositiveDecimal> | undefined,
): boolean {
  return !powers || Object.keys(powers).length === 0
}

export function stringifyChoice(powers: Record<string, PositiveDecimal>) {
  return Object.keys(powers).sort().join(', ')
}
