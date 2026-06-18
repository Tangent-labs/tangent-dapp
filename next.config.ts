import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    // Stub out unavailable wagmi connector peer deps
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "porto/internal": false,
      porto: false,
      "@react-native-async-storage/async-storage": false,
      // Optional Tempo connector peer dep, loaded via guarded dynamic import
      accounts: false,
    }
    return config
  },
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
