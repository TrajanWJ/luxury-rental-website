import type { Metadata } from 'next'
import { Playfair_Display, Work_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { DemoProvider } from '@/components/demo-context'
import { ConciergeProvider } from '@/components/concierge-context'
import { ContactModal } from '@/components/contact-modal'

import Script from 'next/script'

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const workSans = Work_Sans({ subsets: ["latin"], variable: '--font-work-sans' });

export const metadata: Metadata = {
  title: 'Luxury Rentals | Premium Home Experiences',
  description: 'Exquisite luxury rentals for discerning travelers. Curated stays in the world\'s most beautiful locations.',
  generator: 'luxury-rentals',
  metadataBase: new URL('https://wilson-premier.com'),
  icons: {
    icon: 'https://wilson-premier.com/wp-content/uploads/2023/12/WPP_Digital_RGB_logo_linen_on_charcoal.png',
    apple: 'https://wilson-premier.com/wp-content/uploads/2023/12/WPP_Digital_RGB_logo_linen_on_charcoal.png',
  },
  openGraph: {
    title: 'Wilson Premier Properties | Luxury Lakefront Rentals',
    description: 'Experience the extraordinary at Smith Mountain Lake. Book your curated luxury stay in our signature properties.',
    images: [
      {
        url: '/images/suite-retreat/suite-retreat-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Suite Retreat - Luxury Lakefront Estate',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wilson Premier Properties',
    description: 'Luxury rentals at Smith Mountain Lake.',
    images: ['/images/suite-retreat/suite-retreat-1.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${playfair.variable} ${workSans.variable}`}>
        <DemoProvider>
          <ConciergeProvider>
            {children}
            <ContactModal />
          </ConciergeProvider>
        </DemoProvider>
        <Analytics />
        <Script src="https://d2q3n06xhbi0am.cloudfront.net/calendar.js" strategy="afterInteractive" />
        <Script src="/hostaway-debug.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
