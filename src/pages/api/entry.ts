import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../utils/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    did: string
  }

  const entry = await database.entry.findUnique({
    where: { did: query.did },
  })
  if (entry) {
    res.json(entry)
  } else {
    res.status(404).send(null)
  }
}
