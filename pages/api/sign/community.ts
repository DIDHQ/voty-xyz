import type { NextApiRequest, NextApiResponse } from 'next'

import { arweave } from '../../../src/arweave'
import { database } from '../../../src/database'
import { getArweaveTags } from '../../../src/utils/arweave-tags'
import verifyCommunity from '../../../src/verifiers/verify-community'

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { community } = await verifyCommunity(req.body)

    const data = Buffer.from(textEncoder.encode(JSON.stringify(community)))
    const transaction = await arweave.createTransaction({ data })
    const tags = getArweaveTags(community)
    Object.entries(tags).forEach(([key, value]) => {
      transaction.addTag(key, value)
    })
    await arweave.transactions.sign(transaction, jwk)
    const uploader = await arweave.transactions.getUploader(transaction)

    const id = `ar://${transaction.id}`
    const ts = new Date()
    await database.$transaction([
      database.entry.upsert({
        where: { id: community.author.did },
        create: {
          id: community.author.did,
          community: id,
          ts,
        },
        update: {
          community: id,
          ts,
        },
      }),
      database.community.create({
        data: { id, ts, entry: community.author.did, data },
      }),
    ])

    res.status(200).json(uploader)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message)
    }
  }
}
