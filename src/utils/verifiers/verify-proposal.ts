import { TRPCError } from '@trpc/server'

import { checkBoolean } from '../functions/boolean'
import { Authorized } from '../schemas/authorship'
import { Community } from '../schemas/community'
import { Group } from '../schemas/group'
import { Proved } from '../schemas/proof'
import { Proposal } from '../schemas/proposal'
import { getByPermalink } from '../database'
import { commonCoinTypes, DataType } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'

export default async function verifyProposal(
  proposal: Proved<Authorized<Proposal>>,
): Promise<{
  community: Proved<Authorized<Community>>
  group: Group
}> {
  const [timestamp, data] = await Promise.all([
    getPermalinkSnapshot(proposal.community).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    getByPermalink(DataType.COMMUNITY, proposal.community),
  ])
  if (!timestamp || !data) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Community not found' })
  }
  const community = data.data

  const group = community.groups?.find(({ id }) => id === proposal.group)
  if (!group) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Group not found' })
  }

  if (group.extension.type === 'grant' && proposal.options?.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Group type mismatch' })
  }

  if (group.extension.type === 'workgroup' && !proposal.options?.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Group type mismatch' })
  }

  if (
    !(await checkBoolean(
      group.permission.proposing,
      proposal.authorship.author,
      proposal.snapshots,
    ))
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Proposing permission denied',
    })
  }

  return { community, group }
}
