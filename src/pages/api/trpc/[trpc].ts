import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'

import { appRouter } from '../../../server/routers/_app'
import { cacheControl } from '@/src/utils/constants'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () => ({ req }),
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
}
