/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  experimental: {
    outputFileTracingRoot: undefined
  }
}

module.exports = nextConfig 