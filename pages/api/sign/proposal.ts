import type { NextApiRequest, NextApiResponse } from 'next'

import { arweave } from '../../../src/arweave'
import { database } from '../../../src/database'
import { resolveDid } from '../../../src/did'
import { checkBoolean } from '../../../src/functions/boolean'
import {
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
} from '../../../src/schemas'
import { verifySignature, wrapJsonMessage } from '../../../src/signature'
import { mapSnapshots, getCurrentSnapshot } from '../../../src/snapshot'
import { DID } from '../../../src/types'
import { getArweaveTags } from '../../../src/utils/arweave-tags'

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // verify schema
  const proposalWithAuthor = proposalWithAuthorSchema.safeParse(req.body)
  if (!proposalWithAuthor.success) {
    res.status(400).send(`schema error: ${proposalWithAuthor.error.message}`)
    return
  }

  // verify author
  const { author, ...proposal } = proposalWithAuthor.data
  const snapshot = BigInt(author.snapshot)
  const { coinType, address } = await resolveDid(author.did, {
    [author.coin_type]: snapshot,
  })
  if (
    coinType !== author.coin_type ||
    address !== author.address ||
    !verifySignature(await wrapJsonMessage(proposal), author)
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

  const communityWithAuthor = communityWithAuthorSchema.safeParse(
    JSON.parse(
      (await arweave.transactions.getData(
        proposal.community.replace(/^ar:\/\//, ''),
        {
          decode: true,
          string: true,
        },
      )) as string,
    ),
  )
  if (!communityWithAuthor.success) {
    res
      .status(400)
      .send(`community schema error: ${communityWithAuthor.error.message}`)
    return
  }

  const group = communityWithAuthor.data.groups?.find(
    ({ extension: { id } }) => id === proposal.group,
  )
  if (!group) {
    res.status(400).send('group not found')
    return
  }

  if (
    !(await checkBoolean(
      group.proposal_rights,
      proposalWithAuthor.data.author.did as DID,
      mapSnapshots(proposalWithAuthor.data.snapshots),
    ))
  ) {
    res.status(400).send('does not have proposal rights')
    return
  }

  // TODO: extra verifies

  const data = Buffer.from(
    textEncoder.encode(JSON.stringify(proposalWithAuthor.data)),
  )
  const transaction = await arweave.createTransaction({ data })
  const tags = getArweaveTags(proposalWithAuthor.data)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  const id = `ar://${transaction.id}`

  await database.proposal.upsert({
    where: { id },
    create: {
      id,
      entry: communityWithAuthor.data.author.did,
      community: proposal.community,
      group: proposal.group,
      data,
    },
    update: {
      entry: communityWithAuthor.data.author.did,
      community: proposal.community,
      group: proposal.group,
      data,
    },
  })

  res.status(200).json(uploader)
}
