import { uniq } from 'lodash-es'
import pMap from 'p-map'
import { ProposerLibertySets, BooleanUnit } from '../../schemas'
import { ProposerLibertyFunction } from '../types'
import { sub_did } from './sub-did'
import { exact_did } from './exact-did'
import { DID, Snapshots } from '../../types'

export const checkProposerLibertyFunctions: {
  [name: string]: ProposerLibertyFunction<any[]>
} = {
  sub_did,
  exact_did,
}

export async function checkProposerLiberty(
  data: ProposerLibertySets | BooleanUnit,
  did: DID,
  snapshots: Snapshots,
): Promise<boolean> {
  if ('operator' in data) {
    const results = await pMap(
      data.operands,
      (operand) => checkProposerLiberty(operand, did, snapshots),
      { concurrency: 5 },
    )
    if (data.operator === 'and') {
      return results.every((result) => result)
    } else if (data.operator === 'or') {
      return results.some((result) => result)
    } else if (data.operator === 'not') {
      return !results[0]
    }
    throw new Error(`unsupported operator: ${data.operator}`)
  }
  return checkProposerLibertyFunctions[data.function](
    ...data.arguments,
  ).execute(did, snapshots)
}

export function requiredCoinTypesOfProposerLiberty(
  data: ProposerLibertySets | BooleanUnit,
): number[] {
  if ('operator' in data) {
    return uniq(
      Array.from(data.operands).flatMap((operand) =>
        requiredCoinTypesOfProposerLiberty(operand),
      ),
    )
  }
  return checkProposerLibertyFunctions[data.function](...data.arguments)
    .requiredCoinTypes
}
