const path = require('path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          'bn.js': path.join(__dirname, 'node_modules/bn.js/lib/bn.js'),
        },
      },
    }
  },
}

module.exports = withBundleAnalyzer(nextConfig)
