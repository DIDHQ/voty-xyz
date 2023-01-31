import { last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { voteWithAuthorSchema } from '../../../src/schemas'

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
    cursor: query.next ? { uri: query.next } : undefined,
    where: { proposal: query.proposal },
    take: 50,
    orderBy: { ts: 'desc' },
  })
  res.json({
    data: votes
      .map(({ uri, data }) => {
        try {
          return {
            uri,
            ...voteWithAuthorSchema.parse(JSON.parse(textDecoder.decode(data))),
          }
        } catch {
          return
        }
      })
      .filter((vote) => vote),
    next: last(votes)?.uri,
  })
}
