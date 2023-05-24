import { z } from 'zod'

import { procedure, router } from '../trpc'
import { defaultArweaveTags, getUploader } from '../../utils/upload'
import { id2Permalink } from '../../utils/permalink'

export const imageRouter = router({
  calcPermalink: procedure
    .input(
      z.object({
        data: z.string(),
        type: z.string(),
      }),
    )
    .output(z.string())
    .query(async ({ input }) => {
      const uploader = await getUploader(Buffer.from(input.data, 'base64'), {
        ...defaultArweaveTags,
        'Content-Type': input.type,
      })
      return id2Permalink(uploader.toJSON().transaction.id)
    }),
})

export type ImageRouter = typeof imageRouter
