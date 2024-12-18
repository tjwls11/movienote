/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      'image.tmdb.org',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  postcss: true,
}

module.exports = nextConfig
