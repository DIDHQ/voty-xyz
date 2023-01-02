import { uniq } from 'lodash-es'
import pMap from 'p-map'
import { ProposerLibertySets, ProposerLibertyUnit } from '../../schemas'
import { DID, ProposerLibertyFunction, Snapshots } from '../types'
import { sub_did } from './sub-did'
import { whitelist } from './whitelist'

export const check_proposer_liberty_functions: {
  [name: string]: ProposerLibertyFunction<any[]>
} = {
  sub_did,
  whitelist,
}

export async function check_proposer_liberty(
  data: ProposerLibertySets | ProposerLibertyUnit,
  did: DID,
  snapshots: Snapshots,
): Promise<boolean> {
  if ('operator' in data) {
    const results = await pMap(
      data.operands,
      (operand) => check_proposer_liberty(operand, did, snapshots),
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
  return check_proposer_liberty_functions[data.function](
    ...data.arguments,
  ).execute(did, snapshots)
}

export function required_coin_types_of_proposer_liberty(
  data: ProposerLibertySets | ProposerLibertyUnit,
): number[] {
  if ('operator' in data) {
    return uniq(
      Array.from(data.operands).flatMap((operand) =>
        required_coin_types_of_proposer_liberty(operand),
      ),
    )
  }
  return check_proposer_liberty_functions[data.function](...data.arguments)
    .required_coin_types
}
