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
  productionBrowserSourceMaps: false,
}

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
})
