import { getArweaveData } from '../arweave'
import { calculateNumber } from '../functions/number'
import { Authorized, Proposal, Vote, voteWithAuthorSchema } from '../schemas'
import { mapSnapshots } from '../snapshot'
import { DID } from '../types'
import verifyAuthor from './verify-author'
import verifyProposal from './verify-proposal'

export default async function verifyVote(
  json: object,
): Promise<{ vote: Authorized<Vote>; proposal: Authorized<Proposal> }> {
  const parsed = voteWithAuthorSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const vote = parsed.data

  await verifyAuthor(vote)

  const data = await getArweaveData(vote.proposal)
  if (!data) {
    throw new Error('proposal not found')
  }
  const { proposal, group } = await verifyProposal(data)

  const votingPower = await calculateNumber(
    group.permission.voting,
    vote.author.did as DID,
    mapSnapshots(proposal.snapshots),
  )
  if (votingPower !== vote.power) {
    throw new Error('voting power not match')
  }

  return { vote, proposal }
}
