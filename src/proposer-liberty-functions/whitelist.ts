import { ProposerLibertyFunction } from '../types'

export const whitelist: ProposerLibertyFunction<[string]> = (csv) => {
  return async (did, snapshot) => {
    return true
  }
}
