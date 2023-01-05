import Arweave from 'arweave'
import { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
import { useCallback } from 'react'
import { fetchJson } from '../src/utils/fetcher'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function useArweaveUpload(
  signerPath: string,
  body?: Uint8Array,
) {
  return useCallback(async () => {
    if (!body) {
      return null
    }
    const serializedUploader = await fetchJson<SerializedUploader>(signerPath, {
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
  }, [body, signerPath])
}
