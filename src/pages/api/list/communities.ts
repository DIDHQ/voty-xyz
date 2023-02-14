import { keyBy, last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../utils/database'
import { communityWithAuthorSchema } from '../../../utils/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    next?: string
  }
  const entries = await database.entry.findMany({
    cursor: query.next ? { did: query.next } : undefined,
    take: 50,
    orderBy: { ts: 'desc' },
  })
  const communities = keyBy(
    await database.community.findMany({
      where: { permalink: { in: entries.map(({ community }) => community) } },
    }),
    ({ permalink }) => permalink,
  )
  res.json({
    data: entries
      .map(({ community }) => communities[community])
      .filter((community) => community)
      .map(({ permalink, data }) => {
        try {
          return {
            permalink,
            ...communityWithAuthorSchema.parse(
              JSON.parse(textDecoder.decode(data)),
            ),
          }
        } catch {
          return
        }
      })
      .filter((community) => community),
    next: last(entries)?.did,
  })
}
