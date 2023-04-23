import { TRPCError } from '@trpc/server'

import { checkBoolean } from '../functions/boolean'
import { Authorized, authorized } from '../schemas/authorship'
import { Group, groupSchema } from '../schemas/group'
import { Proved, proved } from '../schemas/proof'
import { Proposal } from '../schemas/proposal'
import { database } from '../database'
import { commonCoinTypes } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'

const schema = proved(authorized(groupSchema))

export default async function verifyProposal(
  proposal: Proved<Authorized<Proposal>>,
): Promise<{
  group: Proved<Authorized<Group>>
}> {
  const [timestamp, data] = await Promise.all([
    getPermalinkSnapshot(proposal.group).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    database.storage.findUnique({ where: { permalink: proposal.group } }),
  ])
  if (!timestamp || !data) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Group not found' })
  }
  const group = schema.parse(data.data)

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

  return { group }
}
