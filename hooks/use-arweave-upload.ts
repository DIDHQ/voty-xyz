import Arweave from 'arweave'
import { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
import { useCallback } from 'react'

import {
  OrganizationWithSignature,
  ProposalWithSignature,
} from '../src/schemas'
import { getArweaveTags } from '../src/utils/arweave-tags'
import { dataTypeOf } from '../src/utils/data-type'
import { fetchJson } from '../src/utils/fetcher'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function useArweaveUpload(
  json?: OrganizationWithSignature | ProposalWithSignature,
) {
  return useCallback(async () => {
    if (!json) {
      return
    }
    const textEncoder = new TextEncoder()
    const body = textEncoder.encode(JSON.stringify(json))
    try {
      const transaction = await arweave.createTransaction({ data: body })
      const tags = await getArweaveTags(json)
      Object.entries(tags).forEach(([key, value]) => {
        transaction.addTag(key, value)
      })
      await arweave.transactions.sign(transaction, 'use_wallet')
      const uploader = await arweave.transactions.getUploader(transaction)
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      return transaction.id
    } catch {
      const serializedUploader = await fetchJson<SerializedUploader>(
        `/api/${dataTypeOf(json)}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
        },
      )
      const uploader = await arweave.transactions.getUploader(
        serializedUploader,
        body,
      )
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      return serializedUploader.transaction.id as string
    }
  }, [json])
}
