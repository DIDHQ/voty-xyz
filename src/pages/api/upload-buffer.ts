import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../utils/database'
import { permalink2Gateway } from '../../utils/permalink'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const key = req.query.key as string
  const uploadBuffer = await database.uploadBuffer.findUnique({
    where: { key },
  })
  if (uploadBuffer) {
    res.setHeader('Content-Type', uploadBuffer.type)
    res.send(uploadBuffer.data)
  } else {
    res.redirect(permalink2Gateway(key))
  }
}
