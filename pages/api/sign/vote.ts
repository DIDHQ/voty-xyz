import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { resolveDid } from '../../../src/did'
import { calculateNumber } from '../../../src/functions/number'
import {
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
  voteWithAuthorSchema,
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
  const voteWithAuthor = voteWithAuthorSchema.safeParse(req.body)
  if (!voteWithAuthor.success) {
    res.status(400).send(`schema error: ${voteWithAuthor.error.message}`)
    return
  }

  // verify author
  const { author, ...vote } = voteWithAuthor.data
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

  const proposalWithAuthor = proposalWithAuthorSchema.safeParse(
    JSON.parse(
      (await arweave.transactions.getData(vote.proposal, {
        decode: true,
        string: true,
      })) as string,
    ),
  )
  if (!proposalWithAuthor.success) {
    res
      .status(400)
      .send(`proposal schema error: ${proposalWithAuthor.error.message}`)
    return
  }

  const communityWithAuthor = communityWithAuthorSchema.safeParse(
    JSON.parse(
      (await arweave.transactions.getData(proposalWithAuthor.data.community, {
        decode: true,
        string: true,
      })) as string,
    ),
  )
  if (!communityWithAuthor.success) {
    res
      .status(400)
      .send(`community schema error: ${communityWithAuthor.error.message}`)
    return
  }

  const group = communityWithAuthor.data.groups?.find(
    ({ extension: { id } }) => id === proposalWithAuthor.data.group,
  )
  if (!group) {
    res.status(400).send('group not found')
    return
  }

  const votingPower = await calculateNumber(
    group.voting_power,
    voteWithAuthor.data.author.did as DID,
    mapSnapshots(proposalWithAuthor.data.snapshots),
  )
  if (votingPower !== vote.power) {
    res.status(400).send('voting power not match')
    return
  }

  // TODO: extra verifies

  const data = Buffer.from(
    textEncoder.encode(JSON.stringify(voteWithAuthor.data)),
  )
  const transaction = await arweave.createTransaction({ data })
  const tags = getArweaveTags(voteWithAuthor.data)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  const id = `ar://${transaction.id}`

  await database.vote.create({
    data: {
      id,
      community: proposalWithAuthor.data.community,
      group: proposalWithAuthor.data.group,
      proposal: vote.proposal,
      data,
    },
  })

  res.status(200).json(uploader)
}
