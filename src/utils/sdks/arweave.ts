import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'

export const jwk = process.env.ARWEAVE_KEY_FILE
  ? (JSON.parse(process.env.ARWEAVE_KEY_FILE) as JWKInterface)
  : undefined

export default Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})
