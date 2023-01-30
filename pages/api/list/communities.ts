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
    cursor: { id: (req.query.next as string | undefined) || undefined },
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
      .filter(({ community }) => communities[community])
      .map(({ community }) => ({
        id: communities[community].id,
        ...communityWithAuthorSchema.parse(
          textDecoder.decode(communities[community].data),
        ),
      })),
    next: last(entries)?.id,
  })
}
