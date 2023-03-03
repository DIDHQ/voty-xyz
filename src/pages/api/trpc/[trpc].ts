import { createNextApiHandler } from '@trpc/server/adapters/next'
import * as Sentry from '@sentry/nextjs'

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
  onError({ type, path, input, error }) {
    Sentry.withScope((scope) => {
      scope.setFingerprint([type, path || ''])
      scope.setExtra('input', input)
      Sentry.captureException(error)
    })
    console.error('TRPC Error:', type, path, input, error)
  },
})
