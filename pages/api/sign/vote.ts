import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { resolveDid } from '../../../src/did'
import { calculateVotingPower } from '../../../src/functions/voting-power'
import {
  communityWithSignatureSchema,
  proposalWithSignatureSchema,
  voteWithSignatureSchema,
} from '../../../src/schemas'
import { verifySignature, wrapJsonMessage } from '../../../src/signature'
import { getCurrentSnapshot, mapSnapshots } from '../../../src/snapshot'
import { DID } from '../../../src/types'
import { getArweaveTags } from '../../../src/utils/arweave-tags'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // verify schema
  const voteWithSignature = voteWithSignatureSchema.safeParse(req.body)
  if (!voteWithSignature.success) {
    res.status(400).send(`schema error: ${voteWithSignature.error.message}`)
    return
  }

  // verify author
  const { author, ...vote } = voteWithSignature.data
  const snapshot = BigInt(author.snapshot)
  const { coinType, address } = await resolveDid(author.did, {
    [author.coin_type]: snapshot,
  })
  if (
    coinType !== author.coin_type ||
    address !== author.address ||
    !verifySignature(await wrapJsonMessage(vote), author)
  ) {
    res.status(400).send('invalid author')
    return
  }

  // check snapshot timeliness
  const currentSnapshot = await getCurrentSnapshot(coinType)
  if (
    currentSnapshot > snapshot + BigInt(5) ||
    currentSnapshot < snapshot - BigInt(5)
  ) {
    res.status(400).send('outdated snapshot')
    return
  }

  const proposalWithSignature = proposalWithSignatureSchema.safeParse(
    JSON.parse(
      (await arweave.transactions.getData(vote.proposal, {
        decode: true,
        string: true,
      })) as string,
    ),
  )
  if (!proposalWithSignature.success) {
    res
      .status(400)
      .send(`proposal schema error: ${proposalWithSignature.error.message}`)
    return
  }

  const communityWithSignature = communityWithSignatureSchema.safeParse(
    JSON.parse(
      (await arweave.transactions.getData(
        proposalWithSignature.data.community,
        {
          decode: true,
          string: true,
        },
      )) as string,
    ),
  )
  if (!communityWithSignature.success) {
    res
      .status(400)
      .send(`community schema error: ${communityWithSignature.error.message}`)
    return
  }

  const group = communityWithSignature.data.groups?.find(
    ({ id }) => id === proposalWithSignature.data.group,
  )
  if (!group) {
    res.status(400).send('group not found')
    return
  }

  const votingPower = await calculateVotingPower(
    group.voting_power,
    voteWithSignature.data.author.did as DID,
    mapSnapshots(proposalWithSignature.data.snapshots),
  )
  if (votingPower !== vote.power) {
    res.status(400).send('does not have proposer liberty')
    return
  }

  // TODO: extra verifies

  const data = Buffer.from(
    textEncoder.encode(JSON.stringify(voteWithSignature.data)),
  )
  const transaction = await arweave.createTransaction({ data })
  const tags = getArweaveTags(voteWithSignature.data)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)

  await database.vote.create({
    data: {
      id: transaction.id,
      did: vote.did,
      community: vote.community,
      group: vote.group,
      proposal: vote.proposal,
      data,
    },
  })

  res.status(200).json(uploader)
}
