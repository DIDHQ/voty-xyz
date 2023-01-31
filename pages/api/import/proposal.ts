import type { NextApiRequest, NextApiResponse } from 'next'

import { getArweaveData } from '../../../src/arweave'
import { database } from '../../../src/database'
import verifyProposal from '../../../src/verifiers/verify-proposal'

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

    const { proposal, community } = await verifyProposal(json)
    const data = Buffer.from(textEncoder.encode(JSON.stringify(proposal)))

    const ts = new Date()
    await database.proposal.create({
      data: {
        uri,
        ts,
        author: proposal.author.did,
        entry: community.author.did,
        community: proposal.community,
        group: proposal.group,
        data,
      },
    })

    res.status(200).send(null)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message)
    }
  }
}
