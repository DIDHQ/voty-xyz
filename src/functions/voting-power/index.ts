import { max, sum, uniq } from 'lodash-es'
import pMap from 'p-map'
import { NumberSets, NumberUnit } from '../../schemas'
import { DID, Snapshots } from '../../types'
import { VotingPowerFunction } from '../types'
import { erc20_balance } from './erc20-balance'
import { weight_list } from './weight-list'

export const calculateVotingPowerFunctions: {
  [name: string]: VotingPowerFunction<any[]>
} = {
  erc20_balance,
  weight_list,
}

export async function calculateVotingPower(
  data: NumberSets | NumberUnit,
  did: DID,
  snapshots: Snapshots,
): Promise<number> {
  if ('operator' in data) {
    const results = await pMap(
      data.operands,
      (operand) => calculateVotingPower(operand, did, snapshots),
      { concurrency: 5 },
    )
    if (data.operator === 'max') {
      return max(results)!
    } else if (data.operator === 'sum') {
      return sum(results)
    } else if (data.operator === 'sqrt') {
      return Math.sqrt(results[0])
    }
    throw new Error(`unsupported operator: ${data.operator}`)
  }
  return calculateVotingPowerFunctions[data.function](
    ...data.arguments,
  ).execute(did, snapshots)
}

export function requiredCoinTypesOfVotingPower(
  data: NumberSets | NumberUnit,
): number[] {
  if ('operator' in data) {
    return uniq(
      Array.from(data.operands).flatMap((operand) =>
        requiredCoinTypesOfVotingPower(operand),
      ),
    )
  }
  return calculateVotingPowerFunctions[data.function](...data.arguments)
    .requiredCoinTypes
}
