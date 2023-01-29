import { BooleanFunction } from '../types'

export const is_sub_did_of: BooleanFunction<[string[]]> = (did_list) => {
  return {
    requiredCoinTypes: [],
    execute: (did) => {
      const indexOfFirstDot = did.indexOf('.')
      return (
        indexOfFirstDot > 0 &&
        !!did_list.find(
          (item) =>
            did.endsWith(item) &&
            item.length + indexOfFirstDot + 1 === did.length,
        )
      )
    },
  }
}
