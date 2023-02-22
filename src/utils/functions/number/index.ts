import Decimal from 'decimal.js'
import { uniq } from 'lodash-es'
import pMap from 'p-map'

import { DecimalSets, DecimalUnit } from '../../schemas/sets'
import { Snapshots, DecimalFunction } from '../../types'
import { prefixes_dot_suffix_fixed_power } from './prefixes-dot-suffix-fixed-power'

export const calculateDecimalFunctions: {
  [name: string]: DecimalFunction<any[]>
} = {
  prefixes_dot_suffix_fixed_power,
}

export async function calculateDecimal(
  data: DecimalSets | DecimalUnit,
  did: string,
  snapshots: Snapshots,
): Promise<Decimal> {
  if ('operation' in data) {
    const results = await pMap(
      data.operands,
      (operand) => calculateDecimal(operand, did, snapshots),
      { concurrency: 5 },
    )
    if (data.operation === 'max') {
      return results.reduce(
        (a, b) => (a.gte(b) ? a : b),
        new Decimal(-Infinity),
      )
    } else if (data.operation === 'sum') {
      return results.reduce((a, b) => a.add(b), new Decimal(0))
    }
    throw new Error(`unsupported operation: ${data.operation}`)
  }
  return calculateDecimalFunctions[data.function](...data.arguments).execute(
    did,
    snapshots,
  )
}

export function requiredCoinTypesOfDecimalSets(
  data: DecimalSets | DecimalUnit,
): number[] {
  if ('operation' in data) {
    return uniq(
      Array.from(data.operands).flatMap((operand) =>
        requiredCoinTypesOfDecimalSets(operand),
      ),
    )
  }
  return calculateDecimalFunctions[data.function](...data.arguments)
    .requiredCoinTypes
}
