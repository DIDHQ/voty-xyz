import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { NextRequest } from 'next/server'

import { appRouter } from '../../../server/routers/_app'
import Sentry from '@/src/utils/sentry'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () => ({ req }),
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
