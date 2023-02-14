import { router } from '../trpc'
import { communityRouter } from './community'

export const appRouter = router({
  community: communityRouter,
})

export type AppRouter = typeof appRouter
