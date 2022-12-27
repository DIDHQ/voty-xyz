import Ajv from 'ajv'
import type { NextApiRequest, NextApiResponse } from 'next'
import { organizationSchema } from '../../src/schemas'

const ajv = new Ajv()

const validateOrganization = ajv.compile(organizationSchema)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (validateOrganization(req.body)) {
    res.status(200).json({})
  } else {
    res.status(400).json({})
  }
}
