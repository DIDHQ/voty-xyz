import { NextRequest, NextResponse } from 'next/server'

import { database } from '../../utils/database'
import { id2Permalink, permalink2Gateway } from '../../utils/permalink'
import { defaultArweaveTags, getUploader } from '../../utils/upload'
import { table } from '@/src/utils/schema'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    const key = req.nextUrl.searchParams.get('key')
    if (!key) {
      return new Response(null, { status: 400 })
    }
    const uploadBuffer = await database.query.uploadBuffer.findFirst({
      where: (uploadBuffer, { eq }) => eq(uploadBuffer.key, key),
    })
    if (uploadBuffer) {
      return new Response(Buffer.from(uploadBuffer.data as string, 'base64'), {
        headers: {
          'Content-Type': uploadBuffer.type,
          'Cache-Control': 'max-age=86400',
        },
      })
    } else {
      return NextResponse.redirect(permalink2Gateway(key))
    }
  } else if (req.method === 'POST') {
    const type = req.headers.get('Content-Type')
    if (!type) {
      return new Response(null, { status: 400 })
    }
    const raw = Buffer.from(await req.arrayBuffer())
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
    return new Response(key)
  } else {
    return new Response(null, { status: 405 })
  }
}
