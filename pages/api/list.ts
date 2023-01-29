import { NextApiRequest, NextApiResponse } from 'next'
import { DataType } from '../../src/constants'
import { database } from '../../src/database'
import {
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
  voteWithAuthorSchema,
} from '../../src/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { type, ...where } = req.query
  if (type === DataType.COMMUNITY) {
    const communities = await database.community.findMany({ where })
    res.json({
      data: communities.map(({ data, ...community }) => ({
        ...community,
        ...communityWithAuthorSchema.safeParse(
          JSON.parse(textDecoder.decode(data)),
        ),
      })),
    })
  } else if (type === DataType.PROPOSAL) {
    const proposals = await database.proposal.findMany({ where })
    res.json({
      data: proposals.map(({ data, ...proposal }) => ({
        ...proposal,
        ...proposalWithAuthorSchema.safeParse(
          JSON.parse(textDecoder.decode(data)),
        ),
      })),
    })
  } else if (type === DataType.VOTE) {
    const votes = await database.vote.findMany({ where })
    res.json({
      data: votes.map(({ data, ...vote }) => ({
        ...vote,
        ...voteWithAuthorSchema.safeParse(JSON.parse(textDecoder.decode(data))),
      })),
    })
  }
  res.status(400).end()
}
