import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'
import { organizationSchema } from '../../src/schemas'

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
  const parsed = organizationSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).send(`parse error: ${parsed.error.message}`)
    return
  }
  const transaction = await arweave.createTransaction({
    data: JSON.stringify(req.body),
  })
  transaction.addTag('content-type', 'application/json')
  transaction.addTag('app-name', 'voty')
  transaction.addTag('app-version', '0.0.0')
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  res.status(200).json(uploader)
}
