import { ProposerLibertyFunction } from '../types'

export const whitelist: ProposerLibertyFunction<[string]> = async (csv) => {
  return async (did, snapshot) => {
    return true
  }
}
