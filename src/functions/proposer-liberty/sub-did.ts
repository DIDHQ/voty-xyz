import { ProposerLibertyFunction } from '../types'

export const sub_did: ProposerLibertyFunction<[string[]]> = (list) => {
  return {
    required_coin_types: [],
    execute: (did) => {
      const index_of_first_dot = did.indexOf('.')
      return (
        index_of_first_dot > 0 &&
        !!list.find(
          (item) =>
            did.endsWith(item) &&
            item.length + index_of_first_dot + 1 === did.length,
        )
      )
    },
  }
}
