import pMap from 'p-map'
import { SerializedUploader } from 'arweave/node/lib/transaction-uploader'
import { eq, inArray } from 'drizzle-orm'

import { isPermalink } from './permalink'
import { database } from './database'
import arweave from './sdks/arweave'
import { parseImages, parseRoot } from './markdown'
import { table } from './schema'

export function getAllUploadBufferKeys(markdown: string): string[] {
  return parseImages(parseRoot(markdown)).filter(isPermalink)
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
        Buffer.from(data as string, 'base64'),
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
