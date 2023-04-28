import { router } from '../trpc'
import { communityRouter } from './community'
import { grantRouter } from './grant'
import { grantProposalRouter } from './grant-proposal'
import { grantProposalVoteRouter } from './grant-proposal-vote'
import { grantProposalVoteChoiceRouter } from './grant-proposal-vote-choice'
import { groupRouter } from './group'
import { groupProposalRouter } from './group-proposal'
import { groupProposalVoteRouter } from './group-proposal-vote'
import { groupProposalVoteChoiceRouter } from './group-proposal-vote-choice'
import { subscriptionRouter } from './subscription'

export const appRouter = router({
  community: communityRouter,
  grant: grantRouter,
  grantProposal: grantProposalRouter,
  grantProposalVote: grantProposalVoteRouter,
  grantProposalVoteChoice: grantProposalVoteChoiceRouter,
  group: groupRouter,
  groupProposal: groupProposalRouter,
  groupProposalVote: groupProposalVoteRouter,
  groupProposalVoteChoice: groupProposalVoteChoiceRouter,
  subscription: subscriptionRouter,
})

export type AppRouter = typeof appRouter
