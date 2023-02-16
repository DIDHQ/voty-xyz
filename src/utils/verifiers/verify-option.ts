import { getArweaveData } from '../arweave'
import { checkBoolean } from '../functions/boolean'
import {
  Authorized,
  Proposal,
  Option,
  optionWithAuthorSchema,
} from '../schemas'
import verifyAuthor from './verify-author'
import verifyProposal from './verify-proposal'

export default async function verifyOption(
  document: object,
): Promise<{ option: Authorized<Option>; proposal: Authorized<Proposal> }> {
  const parsed = optionWithAuthorSchema.safeParse(document)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const option = parsed.data

  await verifyAuthor(1, option)

  const data = await getArweaveData(option.proposal)
  if (!data) {
    throw new Error('proposal not found')
  }
  const { proposal, group } = await verifyProposal(data)

  if (!group.permission.adding_option) {
    throw new Error('group cannot add option')
  }

  if (
    !(await checkBoolean(
      group.permission.adding_option,
      option.author.did,
      proposal.snapshots,
    ))
  ) {
    throw new Error('does not have adding option permission')
  }

  return { option, proposal }
}
