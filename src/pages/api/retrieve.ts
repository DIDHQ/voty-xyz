import { NextApiRequest, NextApiResponse } from 'next'

import { DataType } from '../../utils/constants'
import { database } from '../../utils/database'
import {
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
  optionWithAuthorSchema,
  voteWithAuthorSchema,
} from '../../utils/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    permalink: string
    type: DataType
  }
  switch (query.type) {
    case DataType.COMMUNITY: {
      const community = await database.community.findUnique({
        where: { permalink: query.permalink },
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
        where: { permalink: query.permalink },
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
        where: { permalink: query.permalink },
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
        where: { permalink: query.permalink },
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
