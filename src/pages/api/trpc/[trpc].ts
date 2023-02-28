import { createNextApiHandler } from '@trpc/server/adapters/next'

import { appRouter } from '../../../server/routers/_app'
import { cacheControl } from '../../../utils/constants'

export default createNextApiHandler({
  router: appRouter,
  responseMeta({ type, errors }) {
    if (errors.length === 0 && type === 'query') {
      return { headers: { [cacheControl[0]]: cacheControl[1] } }
    }
    return {}
  },
})
