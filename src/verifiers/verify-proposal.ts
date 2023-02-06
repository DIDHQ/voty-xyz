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
  group: NonNullable<Community['groups']>[0]
}> {
  const parsed = proposalWithAuthorSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const proposal = parsed.data

  await verifyAuthor(proposal)

  const { community } = await verifyCommunity(
    getArweaveData(proposal.community),
  )

  const group = community.groups?.[proposal.group]
  if (!group) {
    throw new Error('group not found')
  }

  if (
    !(await checkBoolean(
      group.permission.submitting_proposal,
      proposal.author.did as DID,
      mapSnapshots(proposal.snapshots),
    ))
  ) {
    throw new Error('does not have proposal rights')
  }

  return {
    proposal,
    community,
    group,
  }
}
