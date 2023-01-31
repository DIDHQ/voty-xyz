import type { NextApiRequest, NextApiResponse } from 'next'

import { arweave, idToURI } from '../../src/arweave'
import { database } from '../../src/database'
import { getArweaveTags } from '../../src/utils/arweave-tags'
import { isCommunity, isProposal, isVote } from '../../src/utils/data-type'
import verifyCommunity from '../../src/verifiers/verify-community'
import verifyProposal from '../../src/verifiers/verify-proposal'
import verifyVote from '../../src/verifiers/verify-vote'

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const json = req.body

  try {
    const data = Buffer.from(textEncoder.encode(JSON.stringify(json)))
    const transaction = await arweave.createTransaction({ data })
    const tags = getArweaveTags(json)
    Object.entries(tags).forEach(([key, value]) => {
      transaction.addTag(key, value)
    })
    await arweave.transactions.sign(transaction, jwk)
    const uploader = await arweave.transactions.getUploader(transaction)
    const uri = idToURI(transaction.id)
    const ts = new Date()

    if (isCommunity(json)) {
      const { community } = await verifyCommunity(json)
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
    } else if (isProposal(json)) {
      const { proposal, community } = await verifyProposal(json)
      await database.proposal.create({
        data: {
          uri: idToURI(transaction.id),
          ts,
          author: proposal.author.did,
          entry: community.author.did,
          community: proposal.community,
          group: proposal.group,
          data,
        },
      })
    } else if (isVote(json)) {
      const { vote, proposal } = await verifyVote(json)
      await database.vote.create({
        data: {
          uri: idToURI(transaction.id),
          ts,
          author: vote.author.did,
          community: proposal.community,
          group: proposal.group,
          proposal: vote.proposal,
          data,
        },
      })
    } else {
      throw new Error('sign type not supported')
    }

    res.status(200).json(uploader)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message)
    }
  }
}
