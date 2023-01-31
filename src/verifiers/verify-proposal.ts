import { getArweaveData } from '../arweave'
import { checkBoolean } from '../functions/boolean'
import {
  Authorized,
  Community,
  Proposal,
  proposalWithAuthorSchema,
} from '../schemas'
import { mapSnapshots } from '../snapshot'
import { DID } from '../types'
import verifyAuthor from './verify-author'
import verifyCommunity from './verify-community'

export default async function verifyProposal(json: object): Promise<{
  proposal: Authorized<Proposal>
  community: Authorized<Community>
}> {
  const proposal = proposalWithAuthorSchema.safeParse(json)
  if (!proposal.success) {
    throw new Error(`schema error: ${proposal.error.message}`)
  }

  await verifyAuthor(proposal.data)

  const { community } = await verifyCommunity(
    getArweaveData(proposal.data.community),
  )

  const group = community.groups?.find(
    ({ extension: { id } }) => id === proposal.data.group,
  )
  if (!group) {
    throw new Error('group not found')
  }

  if (
    !(await checkBoolean(
      group.proposal_rights,
      proposal.data.author.did as DID,
      mapSnapshots(proposal.data.snapshots),
    ))
  ) {
    throw new Error('does not have proposal rights')
  }

  return {
    proposal: proposal.data,
    community,
  }
}
