import { ProposerLibertyFunction } from '../types'

export const whitelist: ProposerLibertyFunction<[string[]]> = async (list) => {
  const set = new Set(list)

  return async (did) => {
    return set.has(did)
  }
}
