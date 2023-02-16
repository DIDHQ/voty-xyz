import { max, sum, uniq } from 'lodash-es'
import pMap from 'p-map'

import { NumberSets, NumberUnit } from '../../schemas/sets'
import { Snapshots, NumberFunction } from '../../types'
import { prefixes_dot_suffix_fixed_power } from './prefixes-dot-suffix-fixed-power'

export const calculateNumberFunctions: {
  [name: string]: NumberFunction<any[]>
} = {
  prefixes_dot_suffix_fixed_power,
}

export async function calculateNumber(
  data: NumberSets | NumberUnit,
  did: string,
  snapshots: Snapshots,
): Promise<number> {
  if ('operation' in data) {
    const results = await pMap(
      data.operands,
      (operand) => calculateNumber(operand, did, snapshots),
      { concurrency: 5 },
    )
    if (data.operation === 'max') {
      return max(results)!
    } else if (data.operation === 'sum') {
      return sum(results)
    }
    throw new Error(`unsupported operation: ${data.operation}`)
  }
  return calculateNumberFunctions[data.function](...data.arguments).execute(
    did,
    snapshots,
  )
}

export function requiredCoinTypesOfNumberSets(
  data: NumberSets | NumberUnit,
): number[] {
  if ('operation' in data) {
    return uniq(
      Array.from(data.operands).flatMap((operand) =>
        requiredCoinTypesOfNumberSets(operand),
      ),
    )
  }
  return calculateNumberFunctions[data.function](...data.arguments)
    .requiredCoinTypes
}
