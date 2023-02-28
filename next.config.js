const path = require('path')
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})
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
          '@tanstack/react-query': path.join(
            __dirname,
            'node_modules/@tanstack/react-query/build/lib/index.esm.js',
          ),
        },
      },
    }
  },
}

module.exports = withPWA(withBundleAnalyzer(nextConfig))
