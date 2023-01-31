import type { NextApiRequest, NextApiResponse } from 'next'

import { arweave } from '../../../src/arweave'
import { database } from '../../../src/database'
import { getArweaveTags } from '../../../src/utils/arweave-tags'
import verifyVote from '../../../src/verifiers/verify-vote'

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { vote, proposal } = await verifyVote(req.body)

    const data = Buffer.from(textEncoder.encode(JSON.stringify(vote)))
    const transaction = await arweave.createTransaction({ data })
    const tags = getArweaveTags(vote)
    Object.entries(tags).forEach(([key, value]) => {
      transaction.addTag(key, value)
    })
    await arweave.transactions.sign(transaction, jwk)
    const uploader = await arweave.transactions.getUploader(transaction)

    const id = `ar://${transaction.id}`
    const ts = new Date()
    await database.vote.create({
      data: {
        id,
        ts,
        author: vote.author.did,
        community: proposal.community,
        group: proposal.group,
        proposal: vote.proposal,
        data,
      },
    })

    res.status(200).json(uploader)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message)
    }
  }
}
