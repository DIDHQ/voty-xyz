import { getAddress } from 'ethers/lib/utils.js'

import { commonCoinTypes } from '../constants'
import { snapshotPermissionsInfo } from '../das-database'
import { DidChecker } from '../types'

export const bitChecker: DidChecker<'bit'> = (did) => ({
  requiredCoinType: commonCoinTypes.CKB,
  async check(coinType, snapshot, proof) {
    if (coinType !== commonCoinTypes.CKB) {
      throw new Error('coin type mismatch')
    }
    if (proof.type !== 'eth_personal_sign') {
      throw new Error(`unsupported proof type ${proof.type}`)
    }
    const address = await snapshotPermissionsInfo(did, snapshot)
    return getAddress(address) === proof.address
  },
})
