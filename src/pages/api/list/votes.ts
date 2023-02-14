import { last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../utils/database'
import { voteWithAuthorSchema } from '../../../utils/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    proposal: string
    next?: string
  }
  const votes = await database.vote.findMany({
    cursor: query.next ? { permalink: query.next } : undefined,
    where: { proposal: query.proposal },
    take: 50,
    orderBy: { ts: 'desc' },
  })
  res.json({
    data: votes
      .map(({ permalink, data }) => {
        try {
          return {
            permalink,
            ...voteWithAuthorSchema.parse(JSON.parse(textDecoder.decode(data))),
          }
        } catch {
          return
        }
      })
      .filter((vote) => vote),
    next: last(votes)?.permalink,
  })
}
