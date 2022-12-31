import { max, sum } from 'lodash-es'
import pMap from 'p-map'
import { VotingPowerSets, VotingPowerUnit } from '../../schemas'
import { DID, VotingPowerFunction } from '../types'
import { erc20_balance } from './erc20-balance'
import { whitelist } from './whitelist'

const functions: { [name: string]: VotingPowerFunction<any[]> } = {
  erc20_balance,
  whitelist,
}

export async function calculate_voting_power(
  data: VotingPowerSets | VotingPowerUnit,
  did: DID,
  snapshot: bigint,
): Promise<number> {
  if ('operator' in data) {
    const results = await pMap(
      data.operands,
      (operand) => calculate_voting_power(operand, did, snapshot),
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
  return (await functions[data.function](...data.arguments))(did, snapshot)
}
