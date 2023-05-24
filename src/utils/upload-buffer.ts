import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { visit } from 'unist-util-visit'
import pMap from 'p-map'
import { SerializedUploader } from 'arweave/node/lib/transaction-uploader'

import { isPermalink } from './permalink'
import { database } from './database'
import arweave from './sdks/arweave'

export function getAllUploadBufferKeys(markdown: string): string[] {
  const data = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  const set = new Set<string>()
  visit(data, (node) => {
    if (node.type === 'image' && isPermalink(node.url)) {
      set.add(node.url)
    }
  })
  return Array.from(set.values())
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
      await database.uploadBuffer.delete({ where: { key } })
    },
    { concurrency: 2 },
  )
}
