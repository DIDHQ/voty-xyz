import pMap from 'p-map'
import { SerializedUploader } from 'arweave/node/lib/transaction-uploader'
import { eq, inArray } from 'drizzle-orm'

import { isPermalink } from './permalink'
import { database } from './database'
import arweave from './sdks/arweave'
import { getImages } from './markdown'
import { table } from './schema'

export function getAllUploadBufferKeys(markdown: string): string[] {
  return getImages(markdown).filter(isPermalink)
}

export async function flushUploadBuffers(keys: string[]): Promise<void> {
  const uploadBuffers = keys.length
    ? await database.query.uploadBuffer.findMany({
        where: inArray(table.uploadBuffer.key, keys),
      })
    : []
  await pMap(
    uploadBuffers,
    async ({ key, data, metadata }) => {
      const uploader = await arweave.transactions.getUploader(
        metadata as unknown as SerializedUploader,
        Buffer.from(data, 'base64'),
      )
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      await database
        .delete(table.uploadBuffer)
        .where(eq(table.uploadBuffer.key, key))
    },
    { concurrency: 2 },
  )
}
