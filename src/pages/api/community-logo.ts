import { NextRequest } from 'next/server'

import { database } from '../../utils/database'
import { communitySchema } from '@/src/utils/schemas/v1/community'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    const permalink = req.nextUrl.searchParams.get('permalink')
    if (!permalink) {
      return new Response(null, { status: 400 })
    }
    const storage = await database.query.storage.findFirst({
      where: (storage, { eq }) => eq(storage.permalink, permalink),
    })
    if (!storage) {
      return new Response(null, { status: 404 })
    }
    const community = communitySchema.parse(storage.data)
    const [, type, data] =
      community.logo.match(/^data:(\w+\/\w+);base64,(.+)$/) || []
    if (!type || !data) {
      return new Response(null, { status: 500 })
    }
    return new Response(Buffer.from(data, 'base64'), {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'max-age=86400',
      },
    })
  } else {
    return new Response(null, { status: 405 })
  }
}
