import { keyBy, last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { communityWithAuthorSchema } from '../../../src/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    next?: string
  }
  const entries = await database.entry.findMany({
    cursor: query.next ? { id: query.next } : undefined,
    take: 50,
    orderBy: { stars: 'desc' },
  })
  const communities = keyBy(
    await database.community.findMany({
      where: { id: { in: entries.map(({ community }) => community) } },
    }),
    ({ id }) => id,
  )
  res.json({
    data: entries
      .map(({ community }) => communities[community])
      .filter((community) => community)
      .map(({ id, data }) => {
        try {
          return {
            id,
            ...communityWithAuthorSchema.parse(
              JSON.parse(textDecoder.decode(data)),
            ),
          }
        } catch {
          return
        }
      })
      .filter((community) => community),
    next: last(entries)?.id,
  })
}
