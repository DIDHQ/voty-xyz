import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { resolveDid } from '../../../src/did'
import { communityWithSignatureSchema } from '../../../src/schemas'
import { verifySignature, wrapJsonMessage } from '../../../src/signature'
import { getCurrentSnapshot } from '../../../src/snapshot'
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
  const communityWithSignature = communityWithSignatureSchema.safeParse(
    req.body,
  )
  if (!communityWithSignature.success) {
    res
      .status(400)
      .send(`schema error: ${communityWithSignature.error.message}`)
    return
  }

  // verify author
  const { author, ...community } = communityWithSignature.data
  const snapshot = BigInt(author.snapshot)
  const { coinType, address } = await resolveDid(author.did, {
    [author.coin_type]: snapshot,
  })
  if (
    coinType !== author.coin_type ||
    address !== author.address ||
    !verifySignature(await wrapJsonMessage(community), author)
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

  // TODO: extra verifies

  const data = Buffer.from(
    textEncoder.encode(JSON.stringify(communityWithSignature.data)),
  )
  const transaction = await arweave.createTransaction({ data })
  const tags = getArweaveTags(communityWithSignature.data)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)

  await database.$transaction([
    database.community.upsert({
      where: { id: transaction.id },
      create: { id: transaction.id, did: community.did, data },
      update: { did: community.did, data },
    }),
    ...(community.groups?.map((group) =>
      database.group.upsert({
        where: {
          id_community: { id: group.id, community: transaction.id },
        },
        create: {
          id: group.id,
          did: community.did,
          community: transaction.id,
        },
        update: {
          did: community.did,
        },
      }),
    ) || []),
  ])

  res.status(200).json(uploader)
}
