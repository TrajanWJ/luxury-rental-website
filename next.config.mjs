/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
  async rewrites() {
    // On VPS (PERSISTENT_DATA_DIR set), serve uploads from persistent dir via API
    if (process.env.PERSISTENT_DATA_DIR) {
      return [
        {
          source: '/uploads/:path*',
          destination: '/api/uploads/:path*',
        },
      ]
    }
    return []
  },
  async redirects() {
    return [
      { source: '/about-us', destination: '/', permanent: true },
      { source: '/smith-mountain-lake-reunion-homes', destination: '/', permanent: true },
      { source: '/smith-mountain-lake-reunion-homes/suite-retreat', destination: '/properties/suite-retreat', permanent: true },
      { source: '/suite-view', destination: '/properties/suite-view', permanent: true },
      { source: '/milan-manor-house', destination: '/properties/milan-manor', permanent: true },
      { source: '/rentals', destination: '/', permanent: true },
      { source: '/lake-view-condo', destination: '/properties/lake-view', permanent: true },
      { source: '/penthouse-view', destination: '/properties/penthouse-view', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
    ]
  },
}

export default nextConfig
