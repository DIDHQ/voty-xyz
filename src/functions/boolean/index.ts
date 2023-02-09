import { uniq } from 'lodash-es'
import pMap from 'p-map'

import { BooleanSets, BooleanUnit } from '../../schemas'
import { DID, Snapshots } from '../../types'
import { BooleanFunction } from '../types'
import { all } from './all'
import { did } from './did'
import { sub_did } from './sub-did'

export const checkBooleanFunctions: {
  [name: string]: BooleanFunction<any[]>
} = {
  all,
  did,
  sub_did,
}

export async function checkBoolean(
  data: BooleanSets | BooleanUnit,
  did: DID,
  snapshots: Snapshots,
): Promise<boolean> {
  if ('operator' in data) {
    const results = await pMap(
      data.operands,
      (operand) =>
        checkBoolean(operand as unknown as BooleanSets, did, snapshots),
      { concurrency: 5 },
    )
    if ((data.operator as unknown) === 'and') {
      return results.every((result) => result)
    } else if (data.operator === 'or') {
      return results.some((result) => result)
    } else if (data.operator === 'not') {
      return !results[0]
    }
    throw new Error(`unsupported operator: ${data.operator}`)
  }
  return checkBooleanFunctions[data.function](...data.arguments).execute(
    did,
    snapshots,
  )
}

export function requiredCoinTypesOfBooleanSets(
  data: BooleanSets | BooleanUnit,
): number[] {
  if ('operator' in data) {
    return uniq(
      Array.from(data.operands).flatMap((operand) =>
        requiredCoinTypesOfBooleanSets(operand as unknown as BooleanSets),
      ),
    )
  }
  return checkBooleanFunctions[data.function](...data.arguments)
    .requiredCoinTypes
}
