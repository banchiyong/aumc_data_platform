/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['mir.so'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    proxyClientMaxBodySize: '10mb',
  },
}

module.exports = nextConfig
