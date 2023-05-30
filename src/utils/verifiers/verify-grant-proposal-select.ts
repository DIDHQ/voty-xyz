import { TRPCError } from '@trpc/server'

import { GrantPhase, getGrantPhase } from '../phase'
import { checkBoolean } from '../functions/boolean'
import { authorized, Authorized } from '../schemas/basic/authorship'
import { Grant } from '../schemas/v1/grant'
import { proved, Proved } from '../schemas/basic/proof'
import {
  GrantProposal,
  grantProposalSchema,
} from '../schemas/v1/grant-proposal'
import { GrantProposalSelect } from '../schemas/v1/grant-proposal-select'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'
import { database } from '../database'
import verifyGrantProposal from './verify-grant-proposal'

const schema = proved(authorized(grantProposalSchema))

export default async function verifyGrantProposalSelect(
  grantProposalSelect: Proved<Authorized<GrantProposalSelect>>,
): Promise<{
  grantProposal: Proved<Authorized<GrantProposal>>
  grant: Proved<Authorized<Grant>>
}> {
  const storage = await database.storage.findUnique({
    where: { permalink: grantProposalSelect.grant_proposal },
  })
  if (!storage) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal not found' })
  }
  const grantProposal = schema.parse(storage.data)
  const { grant } = await verifyGrantProposal(grantProposal)

  if (!grant.permission.selecting) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing selecting permission',
    })
  }

  const timestamp = await getPermalinkSnapshot(grantProposal.grant).then(
    (snapshot) => getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
  )
  if (
    getGrantPhase(new Date(), timestamp, grant.duration) !==
    GrantPhase.PROPOSING
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Not in proposing phase',
    })
  }

  if (
    !(await checkBoolean(
      grant.permission.selecting,
      grantProposalSelect.authorship.author,
      grant.snapshots,
    ))
  ) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Permission denied',
    })
  }

  return { grantProposal, grant }
}
