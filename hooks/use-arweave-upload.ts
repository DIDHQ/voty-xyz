import Arweave from 'arweave'
import type { SerializedUploader } from 'arweave/web/lib/transaction-uploader'
import { useCallback } from 'react'

import { Authorized, Community, Proposal, Vote } from '../src/schemas'
import { dataTypeOf } from '../src/utils/data-type'
import { fetchJson } from '../src/utils/fetcher'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export default function useArweaveUpload<
  T extends Authorized<Community | Proposal | Vote>,
>() {
  return useCallback(async (json: T) => {
    const textEncoder = new TextEncoder()
    const body = textEncoder.encode(JSON.stringify(json))
    const serializedUploader = await fetchJson<SerializedUploader>(
      `/api/sign/${dataTypeOf(json)}`,
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
  }, [])
}
