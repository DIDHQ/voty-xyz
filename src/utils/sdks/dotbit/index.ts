import { BitNetwork, createInstance, DefaultConfig } from 'dotbit'

import { isTestnet } from '../../constants'

const dotbit = createInstance(
  DefaultConfig[isTestnet ? BitNetwork.testnet : BitNetwork.mainnet],
)

export default dotbit
