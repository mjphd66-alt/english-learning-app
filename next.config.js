/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: '/english-learning-app',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
