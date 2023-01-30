import { keyBy, last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const dids = await database.dID.findMany({
    cursor: { did: req.query.did as string | undefined },
    take: 50,
    orderBy: { stars: 'desc' },
  })
  const communities = keyBy(
    await database.community.findMany({
      where: { id: { in: dids.map(({ community }) => community) } },
    }),
    ({ did }) => did,
  )
  res.json({
    data: dids.map(({ did }) => communities[did]),
    next: last(dids)?.did,
  })
}
