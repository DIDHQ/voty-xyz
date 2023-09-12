import { commonCoinTypes } from '../constants'
import { snapshotPermissionsInfo } from '../sdks/dotbit/snapshot'
import { DidChecker } from '../types'
import { getAddress } from '../sdks/ethers'

export const bitChecker: DidChecker<'bit'> = (did) => ({
  requiredCoinType: commonCoinTypes.CKB,
  async check(coinType, snapshot, proof) {
    if (coinType !== commonCoinTypes.CKB) {
      throw new Error('coin type mismatch')
    }
    const address = await snapshotPermissionsInfo(did, snapshot)
    if (!address) {
      throw new Error(`${did} resolved empty at ${snapshot}`)
    }
    if (proof.type === commonCoinTypes['ETH'].toString()) {
      return getAddress(address) === proof.address
    }
    return address === proof.address
  },
})
