import { getArweaveData, getArweaveTimestamp } from '../arweave'
import { getPeriod, Period } from '../duration'
import { calculateNumber } from '../functions/number'
import { Authorized, Proposal, Vote, voteWithAuthorSchema } from '../schemas'
import verifyAuthor from './verify-author'
import verifyProposal from './verify-proposal'

export default async function verifyVote(
  document: object,
): Promise<{ vote: Authorized<Vote>; proposal: Authorized<Proposal> }> {
  const parsed = voteWithAuthorSchema.safeParse(document)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const vote = parsed.data

  await verifyAuthor(1, vote)

  const [timestamp, data] = await Promise.all([
    getArweaveTimestamp(vote.proposal),
    getArweaveData(vote.proposal),
  ])
  if (!timestamp || !data) {
    throw new Error('proposal not found')
  }
  const { proposal, group } = await verifyProposal(data)

  if (
    getPeriod(Date.now() / 1000, timestamp, group.duration) !== Period.VOTING
  ) {
    throw new Error('not in voting period')
  }

  const votingPower = await calculateNumber(
    group.permission.voting,
    vote.author.did,
    proposal.snapshots,
  )
  if (votingPower !== vote.power) {
    throw new Error('voting power not match')
  }

  return { vote, proposal }
}
