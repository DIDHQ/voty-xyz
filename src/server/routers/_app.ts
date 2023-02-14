import { router } from '../trpc'
import { choiceRouter } from './choice'
import { communityRouter } from './community'
import { proposalRouter } from './proposal'
import { voteRouter } from './vote'

export const appRouter = router({
  choice: choiceRouter,
  community: communityRouter,
  proposal: proposalRouter,
  vote: voteRouter,
})

export type AppRouter = typeof appRouter
