import { checkBoolean } from '../functions/boolean'
import { Authorized, authorized } from '../schemas/authorship'
import { Community } from '../schemas/community'
import { Workgroup } from '../schemas/workgroup'
import { proved, Proved } from '../schemas/proof'
import { Proposal, proposalSchema } from '../schemas/proposal'
import verifyAuthorshipProof from './verify-authorship-proof'
import verifyCommunity from './verify-community'
import { getByPermalink } from '../database'
import { DataType } from '../constants'
import { getArweaveTimestamp } from '../arweave'

export default async function verifyProposal(document: object): Promise<{
  proposal: Proved<Authorized<Proposal>>
  workgroup: Workgroup
  community: Proved<Authorized<Community>>
}> {
  const parsed = proved(authorized(proposalSchema)).safeParse(document)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const proposal = parsed.data

  await verifyAuthorshipProof(proposal)

  const [timestamp, data] = await Promise.all([
    getArweaveTimestamp(proposal.community),
    getByPermalink(DataType.COMMUNITY, proposal.community),
  ])
  if (!timestamp || !data) {
    throw new Error('community not found')
  }
  const { community } = await verifyCommunity(data.data)

  const workgroup = community.workgroups?.find(
    (workgroup) => workgroup.extension.id === proposal.workgroup,
  )
  if (!workgroup) {
    throw new Error('workgroup not found')
  }

  if (
    !(await checkBoolean(
      workgroup.permission.proposing,
      proposal.authorship.author,
      proposal.snapshots,
    ))
  ) {
    throw new Error('does not have proposing permission')
  }

  return {
    proposal,
    community,
    workgroup,
  }
}
