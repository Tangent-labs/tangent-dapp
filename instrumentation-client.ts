import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0, // turned off for now
  enableLogs: false, // ignored for now
  debug: true, // useful for debugging
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
