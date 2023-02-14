import { router } from '../trpc'
import { communityRouter } from './community'
import { proposalRouter } from './proposal'

export const appRouter = router({
  community: communityRouter,
  proposal: proposalRouter,
})

export type AppRouter = typeof appRouter
