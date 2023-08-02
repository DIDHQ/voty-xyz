import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn:
    process.env.NODE_ENV === 'development'
      ? undefined
      : process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})

export default Sentry
