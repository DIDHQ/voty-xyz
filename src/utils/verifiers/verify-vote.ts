import { getArweaveData, getArweaveTimestamp } from '../arweave'
import { getPeriod, Period } from '../duration'
import { calculateNumber } from '../functions/number'
import { Authorized, authorized } from '../schemas/authorship'
import { Community } from '../schemas/community'
import { Workgroup } from '../schemas/workgroup'
import { proved, Proved } from '../schemas/proof'
import { Proposal } from '../schemas/proposal'
import { Vote, voteSchema } from '../schemas/vote'
import verifyAuthorshipProof from './verify-authorship-proof'
import verifyProposal from './verify-proposal'

export default async function verifyVote(document: object): Promise<{
  vote: Proved<Authorized<Vote>>
  proposal: Proved<Authorized<Proposal>>
  workgroup: Workgroup
  community: Proved<Authorized<Community>>
}> {
  const parsed = proved(authorized(voteSchema)).safeParse(document)
  if (!parsed.success) {
    throw new Error(`schema error: ${parsed.error.message}`)
  }

  const vote = parsed.data

  await verifyAuthorshipProof(vote)

  const [timestamp, data] = await Promise.all([
    getArweaveTimestamp(vote.proposal),
    getArweaveData(vote.proposal),
  ])
  if (!timestamp || !data) {
    throw new Error('proposal not found')
  }
  const { proposal, workgroup, community } = await verifyProposal(data)

  if (
    getPeriod(Date.now() / 1000, timestamp, workgroup.duration) !==
    Period.VOTING
  ) {
    throw new Error('not in voting period')
  }

  const votingPower = await calculateNumber(
    workgroup.permission.voting,
    vote.authorship.author,
    proposal.snapshots,
  )
  if (votingPower !== vote.power) {
    throw new Error('voting power not match')
  }

  return { vote, proposal, workgroup, community }
}
