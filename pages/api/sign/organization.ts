import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { resolveDid } from '../../../src/did'
import { organizationWithSignatureSchema } from '../../../src/schemas'
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
  const organizationWithSignature = organizationWithSignatureSchema.safeParse(
    req.body,
  )
  if (!organizationWithSignature.success) {
    res
      .status(400)
      .send(`schema error: ${organizationWithSignature.error.message}`)
    return
  }

  // verify signature
  const { signature, ...organization } = organizationWithSignature.data
  const snapshot = BigInt(signature.snapshot)
  const { coinType, address } = await resolveDid(signature.did, {
    [signature.coin_type]: snapshot,
  })
  if (
    coinType !== signature.coin_type ||
    address !== signature.address ||
    !verifySignature(await wrapJsonMessage(organization), signature)
  ) {
    res.status(400).send('invalid signature')
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
    textEncoder.encode(JSON.stringify(organizationWithSignature.data)),
  )
  const transaction = await arweave.createTransaction({ data })
  const tags = getArweaveTags(organizationWithSignature.data)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)

  await database.$transaction([
    database.organization.upsert({
      where: { id: transaction.id },
      create: { id: transaction.id, did: organization.did, data },
      update: { did: organization.did, data },
    }),
    ...(organization.workgroups?.map((workgroup) =>
      database.workgroup.upsert({
        where: {
          id_organization: { id: workgroup.id, organization: transaction.id },
        },
        create: {
          id: workgroup.id,
          did: organization.did,
          organization: transaction.id,
        },
        update: {
          did: organization.did,
        },
      }),
    ) || []),
  ])

  res.status(200).json(uploader)
}
