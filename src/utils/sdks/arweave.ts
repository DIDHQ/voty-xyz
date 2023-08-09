import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
import { arweaveHost } from '../constants'
import { ARWEAVE_KEY_FILE } from '@/src/env/server'

export const jwk = ARWEAVE_KEY_FILE
  ? (JSON.parse(ARWEAVE_KEY_FILE) as JWKInterface)
  : undefined

export default Arweave.init({
  host: arweaveHost,
  port: 443,
  protocol: 'https',
})
