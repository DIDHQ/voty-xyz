import type { NextApiRequest, NextApiResponse } from 'next'

import { getArweaveData } from '../../../src/arweave'
import { database } from '../../../src/database'
import verifyCommunity from '../../../src/verifiers/verify-community'

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const uri = req.body.uri
  if (typeof uri !== 'string') {
    res.status(400).send('uri is required')
    return
  }

  try {
    const json = await getArweaveData(uri)
    if (!json) {
      throw new Error('uri not found')
    }

    const { community } = await verifyCommunity(json)
    const data = Buffer.from(textEncoder.encode(JSON.stringify(community)))

    const ts = new Date()
    await database.$transaction([
      database.entry.upsert({
        where: { did: community.author.did },
        create: {
          did: community.author.did,
          community: uri,
          ts,
        },
        update: {
          community: uri,
          ts,
        },
      }),
      database.community.create({
        data: { uri, ts, entry: community.author.did, data },
      }),
    ])

    res.status(200).send(null)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message)
    }
  }
}
