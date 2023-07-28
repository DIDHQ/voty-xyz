import pMap from 'p-map'
import { SerializedUploader } from 'arweave/node/lib/transaction-uploader'

import { isPermalink, permalink2Id } from './permalink'
import { database } from './database'
import arweave from './sdks/arweave'
import { getImages } from './markdown'
import { arweaveHost } from './constants'

export function getAllUploadBufferKeys(markdown: string): string[] {
  return getImages(markdown).filter(isPermalink)
}

export async function flushUploadBuffers(keys: string[]): Promise<void> {
  const uploadBuffers = await database.uploadBuffer.findMany({
    where: { key: { in: keys } },
  })
  await pMap(
    uploadBuffers,
    async ({ key, data, metadata }) => {
      const uploader = await arweave.transactions.getUploader(
        metadata as unknown as SerializedUploader,
        data,
      )
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      const id = permalink2Id(key)
      await fetch(`https://${arweaveHost}/task/sync/${id}`, { method: 'POST' })
      await database.uploadBuffer.delete({ where: { key } })
    },
    { concurrency: 2 },
  )
}
