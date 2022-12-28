import Ajv from 'ajv'
import Arweave from 'arweave/node/common'
import { Tag } from 'arweave/node/lib/transaction'
import type { NextApiRequest, NextApiResponse } from 'next'
import { organizationSchema } from '../../src/schemas'

const ajv = new Ajv()

const validateOrganization = ajv.compile(organizationSchema)

const arweave = new Arweave({})

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
    tags: [
      new Tag('content-type', 'application/json'),
      new Tag('app-name', 'voty'),
      new Tag('app-version', '0.0.0'),
      new Tag('app-organization', req.body.organization),
    ],
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  res.status(200).json(uploader)
}
