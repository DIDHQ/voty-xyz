import { Snapshots } from '../types'

export type BooleanFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: string, snapshots: Snapshots) => Promise<boolean> | boolean
}

export type NumberFunction<T> = (...args: T) => {
  requiredCoinTypes: number[]
  execute: (did: string, snapshots: Snapshots) => Promise<number> | number
}
