/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  basePath: '/english-learning-app',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
