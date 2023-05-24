import { z } from 'zod'

import { procedure, router } from '../trpc'
import { defaultArweaveTags, getUploader } from '../../utils/upload'
import { id2Permalink } from '../../utils/permalink'
import { database } from '../../utils/database'

export const uploadBufferRouter = router({
  calcPermalink: procedure
    .input(
      z.object({
        data: z.string(),
        type: z.string(),
      }),
    )
    .output(z.string())
    .query(async ({ input }) => {
      const data = Buffer.from(input.data, 'base64')
      const uploader = await getUploader(data, {
        ...defaultArweaveTags,
        'Content-Type': input.type,
      })
      const metadata = uploader.toJSON()
      const key = id2Permalink(metadata.transaction.id)
      const ts = new Date()
      await database.uploadBuffer.upsert({
        where: { key },
        update: { metadata, type: input.type, data, ts },
        create: { key, metadata, type: input.type, data, ts },
      })
      return key
    }),
})

export type UploadBufferRouter = typeof uploadBufferRouter
