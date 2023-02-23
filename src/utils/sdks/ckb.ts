import CKB from '@nervosnetwork/ckb-sdk-core'

import { isTestnet } from '../constants'

const ckb = new CKB(
  isTestnet
    ? 'https://test-node-api.did.id/node'
    : 'https://node-api.did.id/node',
)

export default ckb
