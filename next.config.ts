import type { NextConfig } from 'next'

const config: NextConfig = {
  async redirects() {
    return [
      { source: '/protos', destination: '/#prototypes', permanent: false },
      { source: '/about', destination: '/#top', permanent: false },
    ]
  },
  async rewrites() {
    return {
      // These run BEFORE checking pages — rewrite static prototype clean-URLs
      beforeFiles: [],
    }
  },
}

export default config
