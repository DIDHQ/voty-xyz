import Ajv from 'ajv'
import Arweave from 'arweave/node/index'
import type { NextApiRequest, NextApiResponse } from 'next'
import { organizationSchema } from '../../src/schemas'

const ajv = new Ajv()

const validateOrganization = ajv.compile(organizationSchema)

const arweave = Arweave.init({})

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!validateOrganization(req.body)) {
    res.status(400).send('validation error')
    return
  }
  const transaction = await arweave.createTransaction({
    data: JSON.stringify(req.body),
  })
  transaction.addTag('content-type', 'application/json')
  transaction.addTag('app-name', 'voty')
  transaction.addTag('app-version', '0.0.0')
  transaction.addTag('app-organization', req.body.organization)
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  res.status(200).json(uploader)
}
