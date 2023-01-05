import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'
import { resolveDid } from '../../src/did'
import { organizationWithSignatureSchema } from '../../src/schemas'
import { verifySignature, wrapJsonMessage } from '../../src/signature'
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
  const parsed = organizationWithSignatureSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).send(`schema error: ${parsed.error.message}`)
    return
  }

  // verify ownership
  if (parsed.data.id !== parsed.data.signature.did) {
    res.status(401).send('no permission')
    return
  }

  // verify signature
  const { signature, ...data } = parsed.data
  const snapshot = BigInt(signature.snapshot)
  const { coinType, address } = await resolveDid(signature.did, {
    [signature.coin_type]: snapshot,
  })
  if (
    coinType !== signature.coin_type ||
    address !== signature.address ||
    !verifySignature(
      await wrapJsonMessage('edit organization', data),
      signature,
    )
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
