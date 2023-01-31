import type { NextApiRequest, NextApiResponse } from 'next'

import { arweave } from '../../../src/arweave'
import { database } from '../../../src/database'
import { getArweaveTags } from '../../../src/utils/arweave-tags'
import verifyProposal from '../../../src/verifiers/verify-proposal'

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { proposal, community } = await verifyProposal(req.body)

    const data = Buffer.from(textEncoder.encode(JSON.stringify(proposal)))
    const transaction = await arweave.createTransaction({ data })
    const tags = getArweaveTags(proposal)
    Object.entries(tags).forEach(([key, value]) => {
      transaction.addTag(key, value)
    })
    await arweave.transactions.sign(transaction, jwk)
    const uploader = await arweave.transactions.getUploader(transaction)

    const ts = new Date()
    await database.proposal.create({
      data: {
        uri: `ar://${transaction.id}`,
        ts,
        author: proposal.author.did,
        entry: community.author.did,
        community: proposal.community,
        group: proposal.group,
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
