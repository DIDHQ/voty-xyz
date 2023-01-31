import type { NextApiRequest, NextApiResponse } from 'next'

import { getArweaveData } from '../../../src/arweave'
import { database } from '../../../src/database'
import verifyVote from '../../../src/verifiers/verify-vote'

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

    const { vote, proposal } = await verifyVote(json)
    const data = Buffer.from(textEncoder.encode(JSON.stringify(vote)))

    const ts = new Date()
    await database.vote.create({
      data: {
        uri,
        ts,
        author: vote.author.did,
        community: proposal.community,
        group: proposal.group,
        proposal: vote.proposal,
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
