import { TRPCError } from '@trpc/server'

import { getPhase, Phase } from '../phase'
import { Authorized } from '../schemas/authorship'
import { Community } from '../schemas/community'
import { Group } from '../schemas/group'
import { Proved } from '../schemas/proof'
import { Proposal } from '../schemas/proposal'
import { Option } from '../schemas/option'
import verifyProposal from './verify-proposal'
import { getByPermalink } from '../database'
import { commonCoinTypes, DataType } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'

export default async function verifyOption(
  option: Proved<Authorized<Option>>,
): Promise<{
  proposal: Proved<Authorized<Proposal>>
  group: Group
  community: Proved<Authorized<Community>>
}> {
  const [timestamp, data] = await Promise.all([
    getPermalinkSnapshot(option.proposal).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    getByPermalink(DataType.PROPOSAL, option.proposal),
  ])
  if (!timestamp || !data) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal not found' })
  }
  const proposal = data.data
  const { community, group } = await verifyProposal(proposal)

  if (getPhase(new Date(), timestamp, group.duration) !== Phase.PROPOSING) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Not in proposing phase',
    })
  }

  return { proposal, group, community }
}
