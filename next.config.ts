import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  /* config options here */
}

export default nextConfig
