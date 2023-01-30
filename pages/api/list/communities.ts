import { keyBy, last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { communityWithAuthorSchema } from '../../../src/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const entries = await database.entry.findMany({
    cursor: req.query.next ? { id: req.query.next as string } : undefined,
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
      .map(({ community }) => {
        try {
          return {
            id: communities[community].id,
            ...communityWithAuthorSchema.parse(
              JSON.parse(textDecoder.decode(communities[community].data)),
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
