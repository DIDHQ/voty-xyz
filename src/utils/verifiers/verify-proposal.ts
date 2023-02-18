import { getArweaveData } from '../arweave'
import { checkBoolean } from '../functions/boolean'
import { Authorized, authorized } from '../schemas/authorship'
import { Community } from '../schemas/community'
import { Group } from '../schemas/group'
import { proved, Proved } from '../schemas/proof'
import { Proposal, proposalSchema } from '../schemas/proposal'
import verifyAuthorshipProof from './verify-authorship-proof'
import verifyCommunity from './verify-community'

export default async function verifyProposal(document: object): Promise<{
  proposal: Proved<Authorized<Proposal>>
  group: Group
  community: Proved<Authorized<Community>>
}> {
  const parsed = proved(authorized(proposalSchema)).safeParse(document)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const proposal = parsed.data

  await verifyAuthorshipProof(proposal)

  const data = await getArweaveData(proposal.community)
  if (!data) {
    throw new Error('community not found')
  }
  const { community } = await verifyCommunity(data)

  const group = community.groups?.find(
    (group) => group.extension.id === proposal.group,
  )
  if (!group) {
    throw new Error('group not found')
  }

  if (
    !(await checkBoolean(
      group.permission.proposing,
      proposal.authorship.author,
      proposal.snapshots,
    ))
  ) {
    throw new Error('does not have proposing permission')
  }

  return {
    proposal,
    community,
    group,
  }
}
