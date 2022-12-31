import pMap from 'p-map'
import { ProposerLibertySets, ProposerLibertyUnit } from '../../schemas'
import { DID, ProposerLibertyFunction } from '../types'
import { whitelist } from './whitelist'

const functions: { [name: string]: ProposerLibertyFunction<any[]> } = {
  whitelist,
}

export async function check_proposer_liberty(
  data: ProposerLibertySets | ProposerLibertyUnit,
  did: DID,
  snapshot: bigint,
): Promise<boolean> {
  if ('operator' in data) {
    const results = await pMap(
      data.operands,
      (operand) => check_proposer_liberty(operand, did, snapshot),
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
  return (await functions[data.function](...data.arguments))(did, snapshot)
}
