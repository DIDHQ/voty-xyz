import { ProposerLibertyFunction } from '../types'

export const sub_did: ProposerLibertyFunction<[string[]]> = (list) => {
  return {
    requiredCoinTypes: [],
    execute: (did) => {
      const indexOfFirstDot = did.indexOf('.')
      return (
        indexOfFirstDot > 0 &&
        !!list.find(
          (item) =>
            did.endsWith(item) &&
            item.length + indexOfFirstDot + 1 === did.length,
        )
      )
    },
  }
}
