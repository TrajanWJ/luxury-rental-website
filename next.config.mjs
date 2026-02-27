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
