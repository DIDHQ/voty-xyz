import { router } from '../trpc'
import { communityRouter } from './community'
import { proposalRouter } from './proposal'
import { voteRouter } from './vote'

export const appRouter = router({
  community: communityRouter,
  proposal: proposalRouter,
  vote: voteRouter,
})

export type AppRouter = typeof appRouter
