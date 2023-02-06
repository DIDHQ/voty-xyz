import { getArweaveData } from '../arweave'
import { checkBoolean } from '../functions/boolean'
import {
  Authorized,
  Proposal,
  Option,
  optionWithAuthorSchema,
} from '../schemas'
import { mapSnapshots } from '../snapshot'
import { DID } from '../types'
import verifyAuthor from './verify-author'
import verifyProposal from './verify-proposal'

export default async function verifyOption(
  json: object,
): Promise<{ option: Authorized<Option>; proposal: Authorized<Proposal> }> {
  const parsed = optionWithAuthorSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const option = parsed.data

  await verifyAuthor(option)

  const { proposal, group } = await verifyProposal(
    getArweaveData(option.proposal),
  )

  if (!group.add_option_rights) {
    throw new Error('group cannot add option')
  }

  if (
    !(await checkBoolean(
      group.add_option_rights,
      option.author.did as DID,
      mapSnapshots(proposal.snapshots),
    ))
  ) {
    throw new Error('does not have adding option rights')
  }

  return { option, proposal }
}
