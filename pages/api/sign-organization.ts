import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'
import { resolve_did } from '../../src/did'
import { organizationSchema } from '../../src/schemas'
import { verifySignature } from '../../src/signature'

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
  const { coin_type, address } = await resolve_did(signature.did, {
    [signature.coin_type]: BigInt(signature.snapshot),
  })
  if (
    coin_type !== signature.coin_type ||
    address !== signature.address ||
    !verifySignature(message, signature)
  ) {
    res.status(400).send('invalid signature')
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
