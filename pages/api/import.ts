import type { NextApiRequest, NextApiResponse } from 'next'

import { getArweaveData } from '../../src/arweave'
import { database } from '../../src/database'
import {
  isCommunity,
  isProposal,
  isOption,
  isVote,
} from '../../src/utils/data-type'
import verifyCommunity from '../../src/verifiers/verify-community'
import verifyProposal from '../../src/verifiers/verify-proposal'
import verifyOption from '../../src/verifiers/verify-option'
import verifyVote from '../../src/verifiers/verify-vote'

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

    const data = Buffer.from(textEncoder.encode(JSON.stringify(json)))
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
        database.community.upsert({
          where: { uri },
          create: { uri, ts, entry: community.author.did, data },
          update: {},
        }),
      ])
    } else if (isProposal(json)) {
      const { proposal, community } = await verifyProposal(json)
      await database.proposal.upsert({
        where: { uri },
        create: {
          uri,
          ts,
          author: proposal.author.did,
          entry: community.author.did,
          community: proposal.community,
          group: proposal.group,
          data,
        },
        update: {},
      })
    } else if (isOption(json)) {
      const { option, proposal } = await verifyOption(json)
      await database.option.upsert({
        where: { uri },
        create: {
          uri,
          ts,
          author: option.author.did,
          community: proposal.community,
          group: proposal.group,
          proposal: option.proposal,
          data,
        },
        update: {},
      })
    } else if (isVote(json)) {
      const { vote, proposal } = await verifyVote(json)
      await database.vote.upsert({
        where: { uri },
        create: {
          uri,
          ts,
          author: vote.author.did,
          community: proposal.community,
          group: proposal.group,
          proposal: vote.proposal,
          data,
        },
        update: {},
      })
    } else {
      throw new Error('import type not supported')
    }

    res.status(200).send({ data: json })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message)
    }
  }
}
