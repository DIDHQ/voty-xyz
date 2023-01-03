import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'
import { resolveDid } from '../../src/did'
import { organizationSchema } from '../../src/schemas'
import { verifySignature } from '../../src/signature'
import { getCurrentSnapshot } from '../../src/snapshot'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // verify schema
  const parsed = organizationSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).send(`schema error: ${parsed.error.message}`)
    return
  }

  // verify signature
  const { signature, ...rest } = parsed.data
  const message = JSON.stringify(rest)
  const snapshot = BigInt(signature.snapshot)
  const { coinType, address } = await resolveDid(signature.did, {
    [signature.coin_type]: snapshot,
  })
  if (
    coinType !== signature.coin_type ||
    address !== signature.address ||
    !verifySignature(message, signature)
  ) {
    res.status(400).send('invalid signature')
    return
  }

  // check snapshot timeliness
  const currentSnapshot = await getCurrentSnapshot(coinType)
  if (
    currentSnapshot > snapshot + BigInt(5) ||
    currentSnapshot < snapshot - BigInt(5)
  ) {
    res.status(400).send('outdated snapshot')
    return
  }

  const transaction = await arweave.createTransaction({
    data: JSON.stringify(parsed.data),
  })
  transaction.addTag('content-type', 'application/json')
  transaction.addTag('app-name', 'voty')
  transaction.addTag('app-version', '0.0.0')
  transaction.addTag('app-organization', signature.did)
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  res.status(200).json(uploader)
}
