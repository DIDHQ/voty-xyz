import { NextApiRequest, NextApiResponse } from 'next'
import { DataType } from '../../src/constants'
import { database } from '../../src/database'
import {
  organizationWithSignatureSchema,
  proposalWithSignatureSchema,
  voteWithSignatureSchema,
} from '../../src/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { type, ...where } = req.query
  if (type === DataType.ORGANIZATION) {
    const organizations = await database.organization.findMany({ where })
    res.json({
      data: organizations.map(({ data, ...organization }) => ({
        ...organization,
        ...organizationWithSignatureSchema.safeParse(
          JSON.parse(textDecoder.decode(data)),
        ),
      })),
    })
  } else if (type === 'workgroup') {
    const data = await database.workgroup.findMany({ where })
    res.json({ data })
  } else if (type === DataType.PROPOSAL) {
    const proposals = await database.proposal.findMany({ where })
    res.json({
      data: proposals.map(({ data, ...proposal }) => ({
        ...proposal,
        ...proposalWithSignatureSchema.safeParse(
          JSON.parse(textDecoder.decode(data)),
        ),
      })),
    })
  } else if (type === DataType.VOTE) {
    const votes = await database.vote.findMany({ where })
    res.json({
      data: votes.map(({ data, ...vote }) => ({
        ...vote,
        ...voteWithSignatureSchema.safeParse(
          JSON.parse(textDecoder.decode(data)),
        ),
      })),
    })
  }
  res.status(400).end()
}
