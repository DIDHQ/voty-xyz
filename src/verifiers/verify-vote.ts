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
  const vote = voteWithAuthorSchema.safeParse(json)
  if (!vote.success) {
    throw new Error(`schema error: ${vote.error.message}`)
  }

  await verifyAuthor(vote.data)

  const { proposal, group } = await verifyProposal(
    getArweaveData(vote.data.proposal),
  )

  const votingPower = await calculateNumber(
    group.voting_power,
    vote.data.author.did as DID,
    mapSnapshots(proposal.snapshots),
  )
  if (votingPower !== vote.data.power) {
    throw new Error('voting power not match')
  }

  return { vote: vote.data, proposal }
}
