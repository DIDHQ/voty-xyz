import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn:
    process.env.NODE_ENV === 'development'
      ? undefined
      : process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
