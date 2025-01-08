import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    disableStaticImages: true,
  },
  /* config options here */
}

export default nextConfig
