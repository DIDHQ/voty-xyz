import { NextRequest, NextResponse } from 'next/server'

import { database } from '../../utils/database'
import { id2Permalink, permalink2Gateway } from '../../utils/permalink'
import { defaultArweaveTags, getUploader } from '../../utils/upload'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    const key = req.nextUrl.searchParams.get('key') as string
    const uploadBuffer = await database.uploadBuffer.findUnique({
      where: { key },
    })
    if (uploadBuffer) {
      const response = new NextResponse(uploadBuffer.data)
      response.headers.set('Content-Type', uploadBuffer.type)
      response.headers.set('Cache-Control', 'max-age=86400')
      return response
    } else {
      return NextResponse.redirect(permalink2Gateway(key))
    }
  } else if (req.method === 'POST') {
    const type = req.headers.get('content-type')
    if (!type) {
      return new NextResponse('no content-type header', { status: 400 })
    }
    const data = Buffer.from(await req.arrayBuffer())
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
    return new NextResponse(key)
  } else {
    return new NextResponse(null, { status: 405 })
  }
}
