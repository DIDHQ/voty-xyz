import { max, sum, uniq } from 'lodash-es'
import pMap from 'p-map'

import { NumberSets, NumberUnit } from '../../schemas'
import { DID, Snapshots } from '../../types'
import { NumberFunction } from '../types'
import { all } from './all'
import { did } from './did'
import { sub_did } from './sub-did'

export const calculateNumberFunctions: {
  [name: string]: NumberFunction<any[]>
} = {
  all,
  did,
  sub_did,
}

export async function calculateNumber(
  data: NumberSets | NumberUnit,
  did: DID,
  snapshots: Snapshots,
): Promise<number> {
  if ('operator' in data) {
    const results = await pMap(
      data.operands,
      (operand) => calculateNumber(operand, did, snapshots),
      { concurrency: 5 },
    )
    if (data.operator === 'max') {
      return max(results)!
    } else if (data.operator === 'sum') {
      return sum(results)
    }
    throw new Error(`unsupported operator: ${data.operator}`)
  }
  return calculateNumberFunctions[data.function](...data.arguments).execute(
    did,
    snapshots,
  )
}

export function requiredCoinTypesOfNumberSets(
  data: NumberSets | NumberUnit,
): number[] {
  if ('operator' in data) {
    return uniq(
      Array.from(data.operands).flatMap((operand) =>
        requiredCoinTypesOfNumberSets(operand),
      ),
    )
  }
  return calculateNumberFunctions[data.function](...data.arguments)
    .requiredCoinTypes
}
