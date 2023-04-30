import { router } from '../trpc'
import { communityRouter } from './community'
import { grantRouter } from './grant'
import { grantProposalRouter } from './grant-proposal'
import { grantProposalVoteRouter } from './grant-proposal-vote'
import { groupRouter } from './group'
import { groupProposalRouter } from './group-proposal'
import { groupProposalVoteRouter } from './group-proposal-vote'
import { subscriptionRouter } from './subscription'

export const appRouter = router({
  community: communityRouter,
  grant: grantRouter,
  grantProposal: grantProposalRouter,
  grantProposalVote: grantProposalVoteRouter,
  group: groupRouter,
  groupProposal: groupProposalRouter,
  groupProposalVote: groupProposalVoteRouter,
  subscription: subscriptionRouter,
})

export type AppRouter = typeof appRouter
