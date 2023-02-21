import { BitNetwork, createInstance, DefaultConfig } from 'dotbit'
import { BitPluginAvatar } from '@dotbit/plugin-avatar'

import { isTestnet } from '../../constants'

const dotbit = createInstance(
  DefaultConfig[isTestnet ? BitNetwork.testnet : BitNetwork.mainnet],
)

dotbit.installPlugin(new BitPluginAvatar())

export default dotbit
