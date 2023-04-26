import { router } from '../trpc'
import { groupProposalVoteChoiceRouter } from './choice'
import { communityRouter } from './community'
import { groupRouter } from './group'
import { groupProposalRouter } from './group-proposal'
import { subscriptionRouter } from './subscription'
import { groupProposalVoteRouter } from './group-proposal-vote'

export const appRouter = router({
  community: communityRouter,
  group: groupRouter,
  groupProposal: groupProposalRouter,
  groupProposalVote: groupProposalVoteRouter,
  groupProposalVoteChoice: groupProposalVoteChoiceRouter,
  subscription: subscriptionRouter,
})

export type AppRouter = typeof appRouter
