import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { NextRequest } from 'next/server'
import { captureError } from '@cfworker/sentry'

import { appRouter } from '../../../server/routers/_app'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () => ({}),
    responseMeta({ type, errors }) {
      if (errors.length === 0 && type === 'query') {
        return {
          headers: {
            'Cache-Control': 'maxage=1, stale-while-revalidate',
          },
        }
      }
      return {}
    },
    onError({ type, path, input, error, req }) {
      if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV) {
        captureError(
          process.env.NEXT_PUBLIC_SENTRY_DSN,
          process.env.NODE_ENV,
          'latest',
          error,
          req,
          {},
        )
      }
      console.error('TRPC Error:', type, path, input, error)
    },
  })
}
