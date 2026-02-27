/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wilson-premier.com',
      },
      {
        protocol: 'https',
        hostname: 'booking.wilson-premier.com',
      },
      {
        protocol: 'https',
        hostname: 'media.wilson-premier.com',
      },
    ],
  },
}

export default nextConfig
