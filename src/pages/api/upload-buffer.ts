import { NextApiRequest, NextApiResponse } from 'next'
import getRawBody from 'raw-body'

import { database } from '../../utils/database'
import { id2Permalink, permalink2Gateway } from '../../utils/permalink'
import { defaultArweaveTags, getUploader } from '../../utils/upload'
import { table } from '@/src/utils/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const key = req.query.key as string
    const uploadBuffer = await database.query.uploadBuffer.findFirst({
      where: (uploadBuffer, { eq }) => eq(uploadBuffer.key, key),
    })
    if (uploadBuffer) {
      res.setHeader('Content-Type', uploadBuffer.type)
      res.setHeader('Cache-Control', 'max-age=86400')
      res.send(Buffer.from(uploadBuffer.data, 'base64'))
    } else {
      res.redirect(permalink2Gateway(key))
    }
  } else if (req.method === 'POST') {
    const type = req.headers['content-type']
    if (!type) {
      res.status(400).send('no content-type header')
      return
    }
    const raw = await getRawBody(req)
    const uploader = await getUploader(raw, {
      ...defaultArweaveTags,
      'Content-Type': type,
    })
    const metadata = uploader.toJSON()
    delete metadata.transaction.chunks
    const key = id2Permalink(metadata.transaction.id)
    const ts = new Date()
    const data = raw.toString('base64')
    await database
      .insert(table.uploadBuffer)
      .values({ key, metadata, type, data, ts })
      .onDuplicateKeyUpdate({
        set: { metadata, type, data, ts },
      })
    res.send(key)
  } else {
    res.status(405).send(null)
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
