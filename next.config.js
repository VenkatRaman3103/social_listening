/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('youtube-search-without-api-key');
    }
    return config;
  },
  transpilePackages: ['youtube-search-without-api-key'],
  sassOptions: {
    includePaths: ['./lib/styles'],
  },
}

module.exports = nextConfig
