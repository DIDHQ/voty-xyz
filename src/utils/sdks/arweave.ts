import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
import { arweaveHost } from '../constants'

export const jwk = process.env.ARWEAVE_KEY_FILE
  ? (JSON.parse(process.env.ARWEAVE_KEY_FILE) as JWKInterface)
  : undefined

export default Arweave.init({
  host: arweaveHost,
  port: 443,
  protocol: 'https',
})
