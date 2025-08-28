import type { NextConfig } from "next"

/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs")

const nextConfig: NextConfig = {
  reactStrictMode: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    domains: ["raw.githubusercontent.com"],
  },
  // IMPORTANT: keep browser source maps OFF in prod (default is false)
  productionBrowserSourceMaps: false,
}

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Keep maps private: delete files after upload so they can't be served
  sourcemaps: { deleteSourcemapsAfterUpload: true },
})
