import type { NextConfig } from "next"

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

  /* config options here */
}

export default nextConfig
