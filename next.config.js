// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PerfseePlugin } = require('@perfsee/webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { scrollRestoration: true },
  modularizeImports: {
    '@heroicons/react/20/solid': {
      transform: '@heroicons/react/20/solid/{{member}}',
    },
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new PerfseePlugin({
          project: 'voty-xyz',
          platform: 'https://perfsee.did.id',
        }),
      )
    }
    return config
  },
}

module.exports = nextConfig
