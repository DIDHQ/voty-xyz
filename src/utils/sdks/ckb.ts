import CKB from '@nervosnetwork/ckb-sdk-core'

import { isTestnet } from '../constants'

const ckb = new CKB(
  isTestnet ? 'https://testnet.ckb.dev/' : 'https://mainnet.ckb.dev/',
)

export default ckb
