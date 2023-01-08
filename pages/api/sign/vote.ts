import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { resolveDid } from '../../../src/did'
import { calculateVotingPower } from '../../../src/functions/voting-power'
import {
  organizationWithSignatureSchema,
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

  // verify signature
  const { signature, ...vote } = voteWithSignature.data
  const snapshot = BigInt(signature.snapshot)
  const { coinType, address } = await resolveDid(signature.did, {
    [signature.coin_type]: snapshot,
  })
  if (
    coinType !== signature.coin_type ||
    address !== signature.address ||
    !verifySignature(await wrapJsonMessage(vote), signature)
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

  const organizationWithSignature = organizationWithSignatureSchema.safeParse(
    JSON.parse(
      (await arweave.transactions.getData(
        proposalWithSignature.data.organization,
        {
          decode: true,
          string: true,
        },
      )) as string,
    ),
  )
  if (!organizationWithSignature.success) {
    res
      .status(400)
      .send(
        `organization schema error: ${organizationWithSignature.error.message}`,
      )
    return
  }

  const workgroup = organizationWithSignature.data.workgroups?.find(
    ({ id }) => id === proposalWithSignature.data.workgroup,
  )
  if (!workgroup) {
    res.status(400).send('workgroup not found')
    return
  }

  const votingPower = await calculateVotingPower(
    workgroup.voting_power,
    voteWithSignature.data.signature.did as DID,
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

  await database.vote.upsert({
    where: { id: transaction.id },
    create: {
      id: transaction.id,
      did: vote.did,
      organization: vote.organization,
      workgroup: vote.workgroup,
      proposal: vote.proposal,
      data,
    },
    update: {
      did: vote.did,
      organization: vote.organization,
      workgroup: vote.workgroup,
      proposal: vote.proposal,
      data,
    },
  })

  res.status(200).json(uploader)
}
