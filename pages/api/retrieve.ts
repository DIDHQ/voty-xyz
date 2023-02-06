import { NextApiRequest, NextApiResponse } from 'next'

import { DataType } from '../../src/constants'
import { database } from '../../src/database'
import {
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
  optionWithAuthorSchema,
  voteWithAuthorSchema,
} from '../../src/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    uri: string
    type: DataType
  }
  switch (query.type) {
    case DataType.COMMUNITY: {
      const community = await database.community.findUnique({
        where: { uri: query.uri },
      })
      if (community) {
        res.json({
          data: communityWithAuthorSchema.parse(
            JSON.parse(textDecoder.decode(community.data)),
          ),
        })
      } else {
        res.status(404).send(null)
      }
      break
    }
    case DataType.PROPOSAL: {
      const proposal = await database.proposal.findUnique({
        where: { uri: query.uri },
      })
      if (proposal) {
        res.json({
          data: proposalWithAuthorSchema.parse(
            JSON.parse(textDecoder.decode(proposal.data)),
          ),
        })
      } else {
        res.status(404).send(null)
      }
      break
    }
    case DataType.OPTION: {
      const option = await database.option.findUnique({
        where: { uri: query.uri },
      })
      if (option) {
        res.json({
          data: optionWithAuthorSchema.parse(
            JSON.parse(textDecoder.decode(option.data)),
          ),
        })
      } else {
        res.status(404).send(null)
      }
      break
    }
    case DataType.VOTE: {
      const vote = await database.vote.findUnique({
        where: { uri: query.uri },
      })
      if (vote) {
        res.json({
          data: voteWithAuthorSchema.parse(
            JSON.parse(textDecoder.decode(vote.data)),
          ),
        })
      } else {
        res.status(404).send(null)
      }
      break
    }
    default: {
      res.status(404).send(null)
      break
    }
  }
}
