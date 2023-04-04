import { router } from '../trpc'
import { choiceRouter } from './choice'
import { communityRouter } from './community'
import { proposalRouter } from './proposal'
import { subscriptionRouter } from './subscription'
import { voteRouter } from './vote'

export const appRouter = router({
  choice: choiceRouter,
  community: communityRouter,
  proposal: proposalRouter,
  subscription: subscriptionRouter,
  vote: voteRouter,
})

export type AppRouter = typeof appRouter
