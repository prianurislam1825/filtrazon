import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Expose APP_MODE to client components
  env: {
    NEXT_PUBLIC_APP_MODE: process.env.APP_MODE ?? 'local',
  },

  images: {
    remotePatterns: [],
  },

  experimental: {
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
}

export default nextConfig
