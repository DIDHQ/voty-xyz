import { createNextApiHandler } from '@trpc/server/adapters/next'

import { appRouter } from '../../../server/routers/_app'
import { createContext } from '../../../utils/trpc/context'

export default createNextApiHandler({
  router: appRouter,
  createContext,
})
