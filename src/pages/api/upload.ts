import type { NextApiRequest, NextApiResponse } from 'next'

import { arweave, id2Permalink } from '../../utils/arweave'
import { database } from '../../utils/database'
import { getArweaveTags } from '../../utils/arweave-tags'
import {
  isCommunity,
  isProposal,
  isOption,
  isVote,
} from '../../utils/data-type'
import verifyCommunity from '../../utils/verifiers/verify-community'
import verifyProposal from '../../utils/verifiers/verify-proposal'
import verifyOption from '../../utils/verifiers/verify-option'
import verifyVote from '../../utils/verifiers/verify-vote'
import { powerOfChoice } from '../../utils/voting'

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const document = req.body

  try {
    const data = Buffer.from(textEncoder.encode(JSON.stringify(document)))
    const transaction = await arweave.createTransaction({ data })
    const tags = getArweaveTags(document)
    Object.entries(tags).forEach(([key, value]) => {
      transaction.addTag(key, value)
    })
    await arweave.transactions.sign(transaction, jwk)
    const uploader = await arweave.transactions.getUploader(transaction)
    const permalink = id2Permalink(transaction.id)
    const ts = new Date()

    if (isCommunity(document)) {
      const { community } = await verifyCommunity(document)
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      await database.$transaction([
        database.entry.upsert({
          where: { did: community.author.did },
          create: {
            did: community.author.did,
            community: permalink,
            subscribers: 0,
            ts,
          },
          update: {
            community: permalink,
            ts,
          },
        }),
        database.community.create({
          data: { permalink, ts, entry: community.author.did, data },
        }),
      ])
    } else if (isProposal(document)) {
      const { proposal, community } = await verifyProposal(document)
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      await database.proposal.create({
        data: {
          permalink: id2Permalink(transaction.id),
          ts,
          author: proposal.author.did,
          entry: community.author.did,
          community: proposal.community,
          group: proposal.group,
          data,
          votes: 0,
        },
      })
    } else if (isOption(document)) {
      const { option, proposal } = await verifyOption(document)
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      await database.option.create({
        data: {
          permalink: id2Permalink(transaction.id),
          ts,
          author: option.author.did,
          community: proposal.community,
          group: proposal.group,
          proposal: option.proposal,
          data,
        },
      })
    } else if (isVote(document)) {
      const { vote, proposal } = await verifyVote(document)
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
      }
      await database.$transaction([
        ...Object.entries(
          powerOfChoice(proposal.voting_type, vote.choice, vote.power),
        ).map(([option, power = 0]) =>
          database.turnout.upsert({
            where: {
              proposal_option: { proposal: vote.proposal, option },
            },
            create: {
              proposal: vote.proposal,
              option,
              power,
            },
            update: {
              power: { increment: power },
            },
          }),
        ),
        database.proposal.update({
          where: { permalink: vote.proposal },
          data: { votes: { increment: 1 } },
        }),
        database.vote.create({
          data: {
            permalink: id2Permalink(transaction.id),
            ts,
            author: vote.author.did,
            community: proposal.community,
            group: proposal.group,
            proposal: vote.proposal,
            data,
          },
        }),
      ])
    } else {
      throw new Error('sign type not supported')
    }

    res.status(200).json({ permalink })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message)
    }
  }
}
