import { keyBy, mapValues } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../utils/database'
import { voteWithAuthorSchema } from '../../utils/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.body as {
    proposal: string
    authors: string[]
  }

  const votes = await database.vote.findMany({
    where: {
      proposal: query.proposal,
      author: { in: query.authors },
    },
  })

  res.json({
    powers: mapValues(
      keyBy(votes, ({ author }) => author),
      ({ data }) =>
        voteWithAuthorSchema.parse(JSON.parse(textDecoder.decode(data))).power,
    ),
  })
}
