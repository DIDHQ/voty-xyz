import { keyBy, last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const entries = await database.entry.findMany({
    cursor: { id: req.query.next as string | undefined },
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
    data: entries.map(({ community }) => communities[community]),
    next: last(entries)?.id,
  })
}
