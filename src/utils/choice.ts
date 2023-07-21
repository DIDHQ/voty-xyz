import { Decimal } from 'decimal.js'
import { mapValues, uniq, without } from 'remeda'

import { PositiveDecimal } from './schemas/basic/positive-decimal'

export function updateChoice(
  powers: Record<string, PositiveDecimal> | undefined,
  choice: string,
): Record<string, PositiveDecimal> {
  const choices = powers?.[choice]
    ? without(Object.keys(powers), choice)
    : uniq([...Object.keys(powers || {}), choice])
  return choices.reduce(
    (obj, choice) => {
      obj[choice] = '1'
      return obj
    },
    {} as Record<string, PositiveDecimal>,
  )
}

export function checkChoice(
  powers: Record<string, PositiveDecimal> | undefined,
  choice: string,
): boolean {
  return !!powers?.[choice]
}

export function powerOfChoice(
  powers: Record<string, PositiveDecimal> | undefined,
  totalPower: Decimal,
): { [choice: string]: Decimal | undefined } {
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
