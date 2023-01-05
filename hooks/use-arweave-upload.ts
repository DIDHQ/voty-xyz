import Arweave from 'arweave'
import { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
import { useCallback } from 'react'

import { Organization, Proposal } from '../src/schemas'
import { fetchJson } from '../src/utils/fetcher'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function useArweaveUpload(
  path: '/api/sign-organization' | '/api/sign-proposal',
  json?: Organization | Proposal,
) {
  return useCallback(async () => {
    if (!json) {
      return
    }
    const textEncoder = new TextEncoder()
    const body = textEncoder.encode(JSON.stringify(json))
    const serializedUploader = await fetchJson<SerializedUploader>(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    })
    const uploader = await arweave.transactions.getUploader(
      serializedUploader,
      body,
    )
    while (!uploader.isComplete) {
      await uploader.uploadChunk()
    }
    return serializedUploader.transaction.id as string
  }, [json, path])
}
