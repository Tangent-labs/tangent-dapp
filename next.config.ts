import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    imageSizes: [16, 20, 25, 32, 35, 48, 50, 64, 96, 128, 256, 384],
  },

  /* config options here */
}

export default nextConfig
