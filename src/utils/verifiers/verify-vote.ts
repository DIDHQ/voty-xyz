import { TRPCError } from '@trpc/server'

import { getPeriod, Period } from '../period'
import { calculateDecimal } from '../functions/number'
import { Authorized } from '../schemas/authorship'
import { Community } from '../schemas/community'
import { Workgroup } from '../schemas/workgroup'
import { Proved } from '../schemas/proof'
import { Proposal } from '../schemas/proposal'
import { Vote } from '../schemas/vote'
import verifyProposal from './verify-proposal'
import { getByPermalink } from '../database'
import { commonCoinTypes, DataType } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'

export default async function verifyVote(
  vote: Proved<Authorized<Vote>>,
): Promise<{
  proposal: Proved<Authorized<Proposal>>
  workgroup: Workgroup
  community: Proved<Authorized<Community>>
}> {
  const [timestamp, data] = await Promise.all([
    getPermalinkSnapshot(vote.proposal).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    getByPermalink(DataType.PROPOSAL, vote.proposal),
  ])
  if (!timestamp || !data) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal not found' })
  }
  const proposal = data.data
  const { community, workgroup } = await verifyProposal(proposal)

  if (getPeriod(new Date(), timestamp, workgroup.duration) !== Period.VOTING) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Not in voting period',
    })
  }

  const votingPower = await calculateDecimal(
    workgroup.permission.voting,
    vote.authorship.author,
    proposal.snapshots,
  )
  if (!votingPower.eq(vote.power)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Voting power not match',
    })
  }

  return { proposal, workgroup, community }
}
