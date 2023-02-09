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
import { powerOfChoice } from '../../src/voting'

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
        database.community.create({
          data: { uri, ts, entry: community.author.did, data },
        }),
      ])
    } else if (isProposal(json)) {
      const { proposal, community } = await verifyProposal(json)
      await database.proposal.create({
        data: {
          uri,
          ts,
          author: proposal.author.did,
          entry: community.author.did,
          community: proposal.community,
          group: proposal.group,
          data,
          voters: 0,
        },
      })
    } else if (isOption(json)) {
      const { option, proposal } = await verifyOption(json)
      await database.option.create({
        data: {
          uri,
          ts,
          author: option.author.did,
          community: proposal.community,
          group: proposal.group,
          proposal: option.proposal,
          data,
        },
      })
    } else if (isVote(json)) {
      const { vote, proposal } = await verifyVote(json)
      await database.$transaction([
        ...Object.entries(
          powerOfChoice(proposal.voting_type, vote.choice, vote.power),
        ).map(([choice, power = 0]) =>
          database.counting.upsert({
            where: {
              proposal_choice: { proposal: vote.proposal, choice },
            },
            create: {
              proposal: vote.proposal,
              choice,
              power,
            },
            update: {
              power: { increment: power },
            },
          }),
        ),
        database.proposal.update({
          where: { uri: vote.proposal },
          data: { voters: { increment: 1 } },
        }),
        database.vote.create({
          data: {
            uri,
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
      throw new Error('import type not supported')
    }

    res.status(200).send({ data: json })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message)
    }
  }
}
