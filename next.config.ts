import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    domains: ["raw.githubusercontent.com", "files.cow.fi"],
  },

  /* config options here */
}

export default nextConfig
