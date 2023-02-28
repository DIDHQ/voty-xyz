import { createNextApiHandler } from '@trpc/server/adapters/next'

import { appRouter } from '../../../server/routers/_app'

const ONE_DAY_IN_SECONDS = 60 * 60 * 24

export default createNextApiHandler({
  router: appRouter,
  responseMeta({ type, errors }) {
    if (errors.length === 0 && type === 'query') {
      return {
        headers: {
          'Cache-Control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
        },
      }
    }
    return {}
  },
})
