import { getArweaveData } from '../arweave'
import {
  Authorized,
  Proposal,
  Option,
  optionWithAuthorSchema,
} from '../schemas'
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

  const { proposal, community } = await verifyProposal(
    getArweaveData(option.data.proposal),
  )

  const group = community.groups?.[proposal.group]
  if (!group) {
    throw new Error('group not found')
  }

  return { option: option.data, proposal }
}
