/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig
