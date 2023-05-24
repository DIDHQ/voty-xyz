import { NextApiRequest, NextApiResponse } from 'next'
import getRawBody from 'raw-body'

import { database } from '../../utils/database'
import { id2Permalink, permalink2Gateway } from '../../utils/permalink'
import { defaultArweaveTags, getUploader } from '../../utils/upload'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const key = req.query.key as string
    const uploadBuffer = await database.uploadBuffer.findUnique({
      where: { key },
    })
    if (uploadBuffer) {
      res.setHeader('Content-Type', uploadBuffer.type)
      res.setHeader('Cache-Control', 'max-age=86400')
      res.send(uploadBuffer.data)
    } else {
      res.redirect(permalink2Gateway(key))
    }
  } else if (req.method === 'POST') {
    const type = req.headers['content-type']
    if (!type) {
      res.status(400).send('no content-type header')
      return
    }
    const data = await getRawBody(req)
    const uploader = await getUploader(data, {
      ...defaultArweaveTags,
      'Content-Type': type,
    })
    const metadata = uploader.toJSON()
    const key = id2Permalink(metadata.transaction.id)
    const ts = new Date()
    await database.uploadBuffer.upsert({
      where: { key },
      update: { metadata, type, data, ts },
      create: { key, metadata, type, data, ts },
    })
  } else {
    res.status(405).send(null)
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
