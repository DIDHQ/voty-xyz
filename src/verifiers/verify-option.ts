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
  const option = optionWithAuthorSchema.safeParse(json)
  if (!option.success) {
    throw new Error(`schema error: ${option.error.message}`)
  }

  await verifyAuthor(option.data)

  const { proposal, group } = await verifyProposal(
    getArweaveData(option.data.proposal),
  )

  if (!group.add_option_rights) {
    throw new Error('group cannot add option')
  }

  if (
    !(await checkBoolean(
      group.add_option_rights,
      option.data.author.did as DID,
      mapSnapshots(proposal.snapshots),
    ))
  ) {
    throw new Error('does not have adding option rights')
  }

  return { option: option.data, proposal }
}
