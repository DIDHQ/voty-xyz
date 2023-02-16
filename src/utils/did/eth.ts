import { commonCoinTypes } from '../constants'
import { DidChecker } from '../types'

export const ethChecker: DidChecker<'eth'> = (did) => ({
  requiredCoinType: commonCoinTypes.ETH,
  async check(coinType, snapshot, proof) {
    if (coinType !== commonCoinTypes.ETH) {
      throw new Error('coin type mismatch')
    }
    if (proof.type !== 'eth_personal_sign') {
      throw new Error(`unsupported proof type ${proof.type}`)
    }
    throw new Error('not implemented yet')
  },
})
